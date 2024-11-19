import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { ToastController, AlertController } from '@ionic/angular';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-pet',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetComponent implements OnInit {
  petForm: FormGroup;
  pets: any[] = [];
  currentPetId: string | null = null;
  loading: boolean = false;
  selectedFile: File | null = null;
  showDatePicker: boolean = false;

  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker; // Cambia el estado de visibilidad
  }// Para almacenar el archivo seleccionado

  // Opciones para el dropdown
  speciesOptions: string[] = ['Perro', 'Gato'];
  breeds: { [key: string]: string[] } = {
    'Perro': ['Labrador', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler'],
    'Gato': ['Persa', 'Siamés', 'Maine Coon', 'Bengalí', 'Sphynx']
  };
  selectedSpecies: string = '';
  breedOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: Firestore,
    private storage: Storage,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required]],
      species: ['', [Validators.required]],
      breed: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      photoUrl: [''],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadPets();
  }

  // Método para manejar el cambio de especie
  onSpeciesChange() {
    this.selectedSpecies = this.petForm.get('species')?.value;
    this.breedOptions = this.breeds[this.selectedSpecies] || [];
    this.petForm.get('breed')?.setValue(''); // Reiniciar raza al cambiar especie
  }

  async loadPets() {
    const currentUserUid = localStorage.getItem('uid');  // Obtener el UID del localStorage

    console.log('UID del usuario desde localStorage:', currentUserUid);  // Verifica el UID

    if (currentUserUid) {
      // Filtrar las mascotas del Firestore que corresponden al UID del usuario
      const petsRef = collection(this.firestore, 'pets');
      const q = query(petsRef, where('uid', '==', currentUserUid));  // Filtrar por UID

      const querySnapshot = await getDocs(q);
      this.pets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Mascotas cargadas:', this.pets);  // Verifica las mascotas cargadas
    } else {
      console.warn('No se encontró un UID en localStorage');
    }
  }


  async onSubmit() {
    if (this.petForm.valid) {
      this.loading = true;
      try {
        if (this.currentPetId) {
          await this.updatePet();
          this.presentToast('¡Mascota actualizada exitosamente!');
        } else {
          await this.createPet();
          this.presentToast('¡Mascota agregada exitosamente!');
        }
      } finally {
        this.loading = false;
      }
      this.petForm.reset();
      this.currentPetId = null; // Reiniciar el ID de la mascota actual después de agregar o actualizar
    }
  }

  async createPet() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const newPet = {
        uid: currentUser.uid,
        ...this.petForm.value,
      };
      await addDoc(collection(this.firestore, 'pets'), newPet);
      this.loadPets();
    }
  }

  async updatePet() {
    if (this.currentPetId) {
      const petRef = doc(this.firestore, `pets/${this.currentPetId}`);
      await updateDoc(petRef, this.petForm.value);
      this.currentPetId = null;
      this.loadPets();
    }
  }

  editPet(pet: any) {
    this.petForm.patchValue({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: pet.birthDate,
      photoUrl: pet.photoUrl,
      notes: pet.notes,
    });
    this.currentPetId = pet.id;
    this.selectedSpecies = pet.species;
    this.breedOptions = this.breeds[this.selectedSpecies] || [];
  }

  async confirmDeletePet(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta mascota?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deletePet(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePet(id: string) {
    await deleteDoc(doc(this.firestore, `pets/${id}`));
    this.loadPets();
    this.presentToast('¡Mascota eliminada exitosamente!');
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) {
      this.selectedFile = file; // Guardar el archivo seleccionado
      const filePath = `pets/${new Date().getTime()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Progreso de carga:', progress);
        },
        (error) => {
          console.error('Error al cargar la imagen:', error);
          this.presentToast('Error al cargar la imagen: ' + error.message);
        },
        async () => {
          const downloadURL = await getDownloadURL(storageRef);
          this.petForm.patchValue({ photoUrl: downloadURL }); // Establecer la URL de la foto en el formulario
          this.presentToast('¡Foto cargada exitosamente!');
        }
      );
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }
}






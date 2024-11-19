import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, query, where, getDocs, onSnapshot, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-vaccine',
  templateUrl: './vaccine.component.html',
  styleUrls: ['./vaccine.component.scss'],
})
export class VaccineComponent implements OnInit {
  vaccineForm: FormGroup;
  loading: boolean = false;
  pets: any[] = [];
  selectedPetId: string | null = null;
  vaccines: any[] = [];
  showDatepicker: boolean = false; // Para controlar la visibilidad del calendario
  maxDate: string; // Para establecer la fecha máxima
  pdfFile: File | null = null; // Para el archivo PDF
  selectedVaccineId: string | null = null; // Para editar
  pdfUploaded: boolean = false; // Para controlar si un PDF ha sido cargado

  @ViewChild('pdfInput', { static: false }) pdfInput!: ElementRef; // Referencia al input de archivo

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.vaccineForm = this.fb.group({
      name: ['', Validators.required],
      applicationDate: ['', Validators.required],
      notes: [''],
      pdfUrl: [''] // Agregar campo para la URL del PDF
    });

    // Establecer las fechas máxima y mínima
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  ngOnInit() {
    this.loadPets();
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


  async loadVaccines() {
    if (this.selectedPetId) {
      console.log(`Cargando vacunas para la mascota con ID: ${this.selectedPetId}`);
      const vaccinesRef = collection(this.firestore, `pets/${this.selectedPetId}/vaccines`);
      onSnapshot(vaccinesRef, (snapshot) => {
        this.vaccines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Vacunas cargadas:', this.vaccines);
      }, (error) => {
        console.error('Error al cargar las vacunas:', error);
      });
    } else {
      console.warn('No hay ID de mascota seleccionada para cargar las vacunas.');
    }
  }

  async onSubmit() {
    if (this.vaccineForm.valid && this.selectedPetId) {
      this.loading = true;
      try {
        if (this.pdfFile) {
          const pdfUrl = await this.uploadPDF(this.pdfFile);
          this.vaccineForm.get('pdfUrl')?.setValue(pdfUrl); // Establece la URL del PDF
        }

        const vaccineRef = collection(this.firestore, `pets/${this.selectedPetId}/vaccines`);
        if (this.selectedVaccineId) {
          // Si estamos editando, actualizamos la vacuna
          const vaccineDocRef = doc(this.firestore, `pets/${this.selectedPetId}/vaccines/${this.selectedVaccineId}`);
          await updateDoc(vaccineDocRef, this.vaccineForm.value);
          this.presentToast('¡Vacuna actualizada exitosamente!');
        } else {
          // Si estamos agregando, creamos una nueva vacuna
          const docRef = await addDoc(vaccineRef, this.vaccineForm.value);
          console.log('Vacuna agregada con ID:', docRef.id);
          this.presentToast('¡Vacuna agregada exitosamente!');
        }

        this.vaccineForm.reset();
        this.showDatepicker = false; // Cerrar el calendario después de agregar/editar la vacuna
        this.selectedVaccineId = null; // Resetea el ID de la vacuna seleccionada
        this.pdfFile = null; // Resetea el archivo PDF
        this.pdfUploaded = false; // Resetea el estado de carga del PDF
      } catch (error) {
        console.error('Error al agregar/actualizar la vacuna:', error);
        this.presentToast('Error al agregar/actualizar la vacuna. Inténtalo de nuevo.');
      } finally {
        this.loading = false;
      }
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  selectPet(petId: string) {
    this.selectedPetId = petId;
    console.log('Mascota seleccionada con ID:', petId); // Verificar que se selecciona la mascota correcta
    this.vaccineForm.reset();
    this.loadVaccines(); // Cargar vacunas al seleccionar una mascota
  }

  toggleDatepicker() {
    this.showDatepicker = !this.showDatepicker; // Cambiar la visibilidad del calendario
  }

  selectVaccine(vaccine: any) {
    this.selectedVaccineId = vaccine.id;
    this.vaccineForm.patchValue(vaccine); // Rellena el formulario con los datos de la vacuna
    this.pdfFile = null; // Resetea el archivo PDF al seleccionar una vacuna
    this.pdfUploaded = false; // Resetea el estado de carga del PDF
  }

  async deleteVaccine(vaccineId: string) {
    const vaccineDocRef = doc(this.firestore, `pets/${this.selectedPetId}/vaccines/${vaccineId}`);
    await deleteDoc(vaccineDocRef);
    this.presentToast('¡Vacuna eliminada exitosamente!');
  }

  onFileSelected(event: any) {
    this.pdfFile = event.target.files[0]; // Captura el archivo PDF seleccionado
    this.pdfUploaded = true; // Cambia el estado a PDF cargado
  }

  openFileSelector() {
    this.pdfInput.nativeElement.click(); // Abre el selector de archivos
  }

  async uploadPDF(file: File): Promise<string> {
    const storage = getStorage();
    const filePath = `vaccines/${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}


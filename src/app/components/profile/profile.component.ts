import { Component, OnInit } from '@angular/core';
import { Storage, uploadBytesResumable, getDownloadURL, ref } from '@angular/fire/storage';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular'; // Importa ToastController
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  editableFields: { [key: string]: boolean } = {
    name: false,
    lastName: false,
    email: false,
    age: false,
    phone: false,
    image: false,
  };

  user: any = {};
  imageUrl: string | null = null; // Variable para almacenar la URL de la imagen
  uploadProgess!: Observable<number>;
  downloadURL$!: Observable<string>;

  name: string = '';
  lastName: string = '';
  age: number | null = null;
  phone: string = '';
  image: string = ''; // Aquí guardamos la URL de la imagen
  email: string = '';
  errorMessage: string = '';
  selectedFile!: File; // Archivo seleccionado
  isLoading: boolean = false; // Estado de carga

  constructor(private authService: AuthService, private storage: Storage, private toastController: ToastController, private router: Router) { } // Inyecta ToastController

  ngOnInit() {
    this.loadUserData();
  }

  // Método para mostrar notificaciones
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    toast.present();
  }

  // Método para cargar el perfil del usuario
  async loadUserData() {
    try {
      // Intenta cargar el UID desde localStorage
      const storedUid = localStorage.getItem('uid');

      if (storedUid) {
        // Recupera los datos del usuario desde Firestore
        const userData = await this.authService.getUserData(storedUid);

        if (userData) {
          this.user = { ...userData, uid: storedUid };
          //console.log('Usuario cargado desde Firestore:', this.user);
        } else {
          console.warn('No se encontraron datos para el UID en Firestore.');
          this.router.navigate(['/login']); // Redirigir si no hay datos
        }
      } else {
        console.warn('No se encontró un UID en localStorage. Redirigiendo a login...');
        this.router.navigate(['/login']); // Redirigir si no hay UID
      }

      // Escuchar cambios en el estado del usuario
      this.authService.user$.subscribe(user => {
        if (user) {
          this.user = user;
          console.log('Estado del usuario:', this.user);
        }
      });

    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.router.navigate(['/login']); // Redirigir en caso de error
    }
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log("Archivo seleccionado:", this.selectedFile);
  }

  // Método para subir el archivo
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const currentUser = this.authService.getCurrentUser(); // Obtener el usuario actual
      if (!currentUser) {
        reject(new Error('Usuario no autenticado.'));
        return;
      }

      const filePath = `files/${currentUser.uid}/${file.name}`;
      const fileRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Progreso de carga:', progress);
        },
        (error) => {
          console.error('Error al cargar el archivo:', error);
          this.showToast('Error al cargar el archivo: ' + error.message); // Notificación de error
          reject(error);
        },
        async () => {
          console.log('¡Archivo subido con éxito!');
          const url = await getDownloadURL(fileRef);
          console.log('URL del archivo:', url);
          this.showToast('¡Archivo subido con éxito!'); // Notificación de éxito
          resolve(url); // Devuelve la URL
        }
      );
    });
  }

  // Método para actualizar el perfil
  async updateProfile() {
    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.isLoading = true; // Iniciar el estado de carga
    try {
      const currentUser = this.authService.getCurrentUser(); // Obtiene el usuario actual
      if (!currentUser) {
        console.error('Usuario no autenticado.');
        this.showToast('Usuario no autenticado.'); // Notificación de error
        return;
      }

      const uid = currentUser.uid;

      // Subir la imagen si hay un archivo seleccionado
      if (this.selectedFile) {
        this.image = await this.uploadFile(this.selectedFile);
      }

      // Crear un objeto para la actualización
      const updatedData: any = {};

      // Solo agregar las propiedades que tienen nuevos valores
      if (this.user.name) updatedData.name = this.user.name;
      if (this.user.lastName) updatedData.lastName = this.user.lastName;
      if (this.user.age !== null && this.user.age !== undefined) updatedData.age = this.user.age;
      if (this.user.phone) updatedData.phone = this.user.phone;
      if (this.image) updatedData.image = this.image; // La URL de la imagen subida

      // Actualizar el usuario con los nuevos datos
      await this.authService.updateUserData(uid, {
        ...this.user, // Combina los datos actuales
        ...updatedData // Solo actualiza los datos nuevos
      });

      // Actualiza la variable de usuario en el componente
      this.user = { ...this.user, ...updatedData };

      console.log('Perfil actualizado exitosamente');
      this.showToast('Perfil actualizado exitosamente'); // Notificación de éxito
    } catch (error: any) {
      this.errorMessage = error.code ? `Error ${error.code}: ${error.message}` : 'Error al actualizar el perfil';
      console.error('Error al actualizar el perfil:', this.errorMessage);
      this.showToast(this.errorMessage); // Notificación de error
    } finally {
      this.isLoading = false; // Finalizar el estado de carga
    }
  }

  isFieldEditable(field: string): boolean {
    return this.editableFields[field];
  }

  toggleEdit(field: string) {
    this.editableFields[field] = !this.editableFields[field];
    if (!this.editableFields[field]) {
      this.imageUrl = null; // Restablecer la nueva imagen si se cierra la edición
    }
  }
}

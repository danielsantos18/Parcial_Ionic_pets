import { Component } from '@angular/core';
import { Storage, uploadBytesResumable, getDownloadURL, ref } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular'; // Importa ToastController

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  uploadProgess!: Observable<number>;
  downloadURL$!: Observable<string>;

  name: string = '';
  lastName: string = '';
  age: number | null = null;
  phone: string = '';
  image: string = ''; // Aquí guardamos la URL de la imagen
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  selectedFile!: File; // Archivo seleccionado
  isLoading: boolean = false; // Estado de carga
  imageAdded: boolean = false; // Variable para controlar si la imagen ha sido agregada

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private toastController: ToastController // Inyecta ToastController
  ) { }

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

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.imageAdded = true; // Cambiar el estado a "imagen agregada"
      this.showToast('Archivo seleccionado: ' + this.selectedFile.name); // Notificación al seleccionar archivo
    }
  }

  // Método para subir el archivo
  uploadFile(file: File, uid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = `files/${uid}/${file.name}`;
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
          this.showToast('¡Archivo subido con éxito!'); // Notificación de éxito
          resolve(url); // Devuelve la URL
        }
      );
    });
  }

  // Método de registro
  async register() {
    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.isLoading = true; // Establecer loading en true

    try {
      // Registrar el usuario
      const { uid } = await this.authService.register(this.email, this.password, {
        name: this.name,
        lastName: this.lastName,
        age: this.age,
        phone: this.phone,
      });

      // Subir la imagen si hay un archivo seleccionado
      if (this.selectedFile) {
        this.image = await this.uploadFile(this.selectedFile, uid); // Usar el UID
      }

      // Actualizar el usuario con la URL de la imagen (si se subió)
      await this.authService.updateUserData(uid, {
        image: this.image, // La URL de la imagen subida
      });

      this.showToast('Registro exitoso'); // Notificación de éxito
      // Redirigir a la página principal o a donde desees después del registro exitoso
      this.router.navigate(['/home']); // Cambiar a /home o a otra ruta deseada
    } catch (error: any) {
      this.errorMessage = error.code ? `Error ${error.code}: ${error.message}` : 'Error en el registro';
      console.error('Error en el registro:', this.errorMessage);
      this.showToast(this.errorMessage); // Notificación de error
    } finally {
      this.isLoading = false; // Asegurarse de que loading se establece en false
    }
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular'; // Importa ToastController

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false; // Estado de carga

  constructor(public authService: AuthService, public router: Router, private toastController: ToastController) { } // Inyecta ToastController

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

  async loginWithEmail() {
    this.errorMessage = ''; // Reiniciar el mensaje de error
    if (!this.email || !this.password) {
      this.errorMessage = 'Email o contraseña no pueden estar vacíos';
      this.showToast(this.errorMessage); // Mostrar notificación de error
      return;
    }

    this.isLoading = true; // Establecer loading en true
    try {
      await this.authService.loginWithEmail(this.email, this.password);
      console.log('Usuario autenticado con email');
      this.router.navigate(['/']); // Redirigir después del inicio de sesión
      this.showToast('Inicio de sesión exitoso'); // Notificación de éxito
    } catch (error: any) {
      this.errorMessage = error.code ? `Error ${error.code}: ${error.message}` : 'Error en la autenticación';
      console.error('Error en la autenticación:', this.errorMessage);
      this.showToast(this.errorMessage); // Mostrar notificación de error
    } finally {
      this.isLoading = false; // Asegurarse de que loading se establece en false 
    }
  }

  async loginWithGoogle() {
    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.isLoading = true; // Establecer loading en true
    try {
      await this.authService.loginWithGoogle();
      console.log('Usuario autenticado con Google');
      this.showToast('Inicio de sesión exitoso con Google'); // Notificación de éxito
      // No redirigir aquí, ya se maneja en AuthService
    } catch (error: any) {
      this.errorMessage = error.code ? `Error ${error.code}: ${error.message}` : 'Error en la autenticación';
      console.error('Error en la autenticación con Google:', this.errorMessage);
      this.showToast(this.errorMessage); // Mostrar notificación de error
    } finally {
      this.isLoading = false; // Asegurarse de que loading se establece en false
    }
  }
}

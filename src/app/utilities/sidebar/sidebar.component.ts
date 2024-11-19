import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  user: any = {};
  imageUrl: string | null = null; // Variable para almacenar la URL de la imagen

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Cargar datos del usuario al iniciar
    this.loadUserData();
  }

  // Método para mostrar notificaciones de error o éxito
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    toast.present();
  }

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
          console.log('Estado del usuario actualizado:', this.user);
        }
      });

    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.router.navigate(['/login']); // Redirigir en caso de error
    }
  }

  // Método de logout
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
      this.showToast('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.showToast('Error al cerrar sesión');
    }
  }

  // Métodos de navegación
  goToPets() {
    this.router.navigate(['/pets']); // Cambié la ruta para que coincida con la convención de minúsculas
  }

  goToVaccines() {
    this.router.navigate(['/vaccine']); // Cambié la ruta para que coincida con la convención de minúsculas
  }

  goToHome() {
    // Aquí puedes agregar la lógica de animación si es necesario
    this.router.navigate(['/home']); // Cambia '/home' por la ruta correcta de tu página principal
  }
}

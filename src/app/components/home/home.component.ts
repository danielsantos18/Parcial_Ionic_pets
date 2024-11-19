import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  user: any = {};

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.loadUserData(); // Llama al método centralizado
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
          console.log('Estado del usuario:', this.user);
        }
      });

    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.router.navigate(['/login']); // Redirigir en caso de error
    }
  }

  goToPets() {
    this.router.navigate(['/pets']); // Navegar a la página de mascotas
  }

  goToVaccines() {
    this.router.navigate(['/vaccine']); // Navegar a la página de vacunas
  }
}

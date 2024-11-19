import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  async canActivate(): Promise<boolean> {
    const uid = localStorage.getItem('uid'); // Verifica si el UID existe en localStorage

    if (uid) {
      return true; // Permitir acceso a la ruta
    } else {
      await this.presentToast('Acceso denegado. Por favor, inicie sesión.');
      this.router.navigate(['/login']); // Redirigir a login si no hay UID
      return false; // Denegar acceso
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}

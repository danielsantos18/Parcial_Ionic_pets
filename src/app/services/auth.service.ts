import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { Firestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Storage, uploadBytesResumable, getDownloadURL, ref } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage, private router: Router) {
    // Inicializa el estado del usuario desde localStorage
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      this.getUserData(storedUid)
        .then(userData => {
          if (userData) {
            this.userSubject.next({ ...userData, uid: storedUid });
          } else {
            console.warn('No se encontraron datos para el UID guardado.');
            this.userSubject.next(null);
          }
        })
        .catch(error => {
          console.error('Error al recuperar el usuario desde Firestore:', error);
          this.userSubject.next(null);
        });
    }

    // Escucha cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        localStorage.setItem('uid', user.uid);
        this.getUserData(user.uid).then(userData => {
          this.userSubject.next({ ...userData, uid: user.uid });
        });
      } else {
        localStorage.removeItem('uid');
        this.userSubject.next(null);
      }
    });
  }


  getCurrentUser(): any | null {
    return this.auth.currentUser;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Guarda el UID en el localStorage
      localStorage.setItem('uid', user.uid);

      // Verifica si el usuario ya existe en Firestore
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        this.router.navigate(['/signup']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      // Guarda el UID en el localStorage
      localStorage.setItem('uid', user.uid);

      // Redirigir a la página principal
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al iniciar sesión con email y contraseña:', error);
      throw error;
    }
  }

  async register(email: string, password: string, additionalData: any): Promise<{ uid: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(this.firestore, `users/${user.uid}`);

      const imageUrl = additionalData.image || null;

      await setDoc(userDocRef, {
        email: user.email,
        name: additionalData.name,
        lastName: additionalData.lastName,
        age: additionalData.age,
        phone: additionalData.phone,
        image: imageUrl,
        createdAt: new Date(),
      });

      // Guarda el UID en el localStorage
      localStorage.setItem('uid', user.uid);

      console.log('Usuario registrado con éxito:', user);

      // Redirigir a la página principal
      this.router.navigate(['/home']);

      // Retorna el UID
      return { uid: user.uid };
    } catch (error) {
      const errorCode = (error as any).code;
      const errorMessage = (error as Error).message || 'Ocurrió un error desconocido';
      console.error('Error en el registro', error);
      throw new Error(`Error ${errorCode}: ${errorMessage}`);
    }
  }


  async getUserData(uid: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('No se pudieron recuperar los datos del usuario.');
    }
  }

  async updateUserData(uid: string, updatedData: any) {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, updatedData, { merge: true });
      console.log('Datos de usuario actualizados con éxito');
    } catch (error) {
      console.error('Error actualizando los datos del usuario:', error);
      throw new Error('No se pudieron actualizar los datos del usuario.');
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      // Limpia el UID del localStorage
      localStorage.removeItem('uid');
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async uploadImage(file: File): Promise<string | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.error('No hay usuario autenticado.');
      throw new Error('Por favor, inicia sesión para cargar imágenes.');
    }

    const userId = currentUser.uid;
    const sanitizedFileName = file.name.replace(/\s+/g, '_');
    const filePath = `pets/${userId}/${new Date().getTime()}_${sanitizedFileName}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const uploadTask = uploadBytesResumable(storageRef, file);
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      console.log('Imagen cargada exitosamente:', downloadURL);
      return downloadURL;
    } catch (error) {
      const errorMessage = (error as Error).message || 'Error desconocido';
      console.error('Error al cargar la imagen:', error);
      throw new Error('Error al cargar la imagen: ' + errorMessage);
    }
  }
}

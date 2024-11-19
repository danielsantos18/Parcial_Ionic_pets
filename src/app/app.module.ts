import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponentModule } from './components/home/home.module';
import { SharedModule } from './shared/shared.module';
import { PetsModule } from './components/pets/pets.module';
import { ProfileModule } from './components/profile/profile.module';
import { ProfileRoutingModule } from './components/profile/profile-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore, } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { VaccineModule } from './components/vaccine/vaccine.module';




@NgModule({
  declarations: [AppComponent,],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    HomeComponentModule,
    ProfileModule,
    PetsModule,
    ProfileRoutingModule,
    VaccineModule

  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.FIREBASE_CONFING)),  // Inicializamos Firebase
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()) // Proveemos Firestorage
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

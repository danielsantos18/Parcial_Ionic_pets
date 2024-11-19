import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PetComponent } from './pets.component';
import { PetsRoutingModule } from './pets-routing.module'; // Importa el módulo de enrutamiento
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    PetsRoutingModule // Asegúrate de incluir el módulo de enrutamiento aquí
  ],
  declarations: [
    PetComponent
  ],
  exports: [
    PetComponent
  ]
})
export class PetsModule { }


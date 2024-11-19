import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importar ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { VaccineComponent } from './vaccine.component';
import { VaccineRoutingModule } from './vaccine-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [VaccineComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Asegúrate de agregar esto
    IonicModule,
    VaccineRoutingModule,
    SharedModule 
  ]
})
export class VaccineModule { }


import { NgModule } from '@angular/core';
import { HomePageRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module'; // Asegúrate de que este módulo contenga Header y Footer

@NgModule({
  imports: [
    HomePageRoutingModule,
    SharedModule,  // Correcto: Importando el módulo compartido
  ],
  declarations: [HomeComponent]  // Solo declara el HomeComponent
})
export class HomeComponentModule { }

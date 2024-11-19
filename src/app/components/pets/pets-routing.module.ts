import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetComponent } from './pets.component'; // Asegúrate de que la ruta sea correcta

const routes: Routes = [
  {
    path: '',
    component: PetComponent // Este es el componente que se mostrará en la ruta /pets
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetsRoutingModule { }

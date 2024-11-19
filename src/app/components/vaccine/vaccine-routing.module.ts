import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VaccineComponent } from './vaccine.component';

const routes: Routes = [
  { path: '', component: VaccineComponent },  // Asegúrate de que esta ruta esté correcta
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VaccineRoutingModule {}

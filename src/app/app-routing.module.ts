import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./components/home/home.module').then(m => m.HomeComponentModule),
    canActivate: [AuthGuard]  // Aplica el guard aquí
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./components/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./components/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]  // Aplica el guard aquí
  },
  {
    path: 'vaccine',  // Ruta para el componente de vacunas
    loadChildren: () => import('./components/vaccine/vaccine.module').then(m => m.VaccineModule),
    canActivate: [AuthGuard]  // Aplica el guard aquí si es necesario
  },
  {
    path: 'pets',  // Ruta para el componente de mascotas
    loadChildren: () => import('./components/pets/pets.module').then(m => m.PetsModule),
    canActivate: [AuthGuard]  // Aplica el guard aquí si es necesario
  }
  
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

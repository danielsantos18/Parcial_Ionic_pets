import { NgModule } from '@angular/core';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SignupPageRoutingModule
  ],
  declarations: [SignupComponent]
})
export class SignupPageModule { }

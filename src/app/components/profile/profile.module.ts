import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    ProfileRoutingModule,
    SharedModule,
  ],
  declarations: [ProfileComponent],
  exports: [ProfileComponent]
})
export class ProfileModule { }

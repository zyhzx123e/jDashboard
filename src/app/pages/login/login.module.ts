import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { AppMaterialModule } from 'src/app/app-material.module';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,ReactiveFormsModule,
    LoginRoutingModule,AppMaterialModule
  ]
})
export class LoginModule { }

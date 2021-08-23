
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { ComponentsModule } from "./components/components.module";



import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AppMaterialModule } from "./app-material.module";
import { ChartsModule } from "./charts/charts.module";

import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { MainComponent } from "./pages//main/main.component";
import {NgxLocalStorageModule} from 'ngx-localstorage';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent,DashboardComponent,MainComponent],
  entryComponents:[DashboardComponent,MainComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ComponentsModule,
    NgxLocalStorageModule.forRoot(),
    CommonModule,
    RouterModule,
    AppMaterialModule,
    ChartsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

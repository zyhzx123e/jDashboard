
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HighchartsChartModule } from "highcharts-angular";
import { AppMaterialModule } from "../app-material.module";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FooterComponent } from "./footer/footer.component";
import { CardComponent } from "./card/card.component";
import { TableComponent } from "./table/table.component";
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';
import { ConfirmationDialog } from './confirm-dialog/confirm-dialog.component';



@NgModule({
  declarations: [ HeaderComponent,
    SidebarComponent,
    FooterComponent,
    CardComponent,
    TableComponent,
    AlertDialogComponent,
    ConfirmationDialog],
  imports: [
    CommonModule,
    RouterModule,
    HighchartsChartModule,
    AppMaterialModule,
  ],
  exports: [ HeaderComponent,
    SidebarComponent,
    FooterComponent,
    CardComponent,
    TableComponent,AlertDialogComponent,ConfirmationDialog],
})
export class ComponentsModule {}

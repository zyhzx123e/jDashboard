
import { Component } from "@angular/core";



@Component({
  selector: "js-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "js-dashboard-angular";

  constructor(){
    console.log('AppComponent entered')
  }
}


import { Component, OnInit } from "@angular/core";
import { AppService } from "../../app.service";

@Component({
  selector: "js-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.triggerResizeEvent();
  }
}

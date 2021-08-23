
import { Component, OnInit } from "@angular/core";
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-localstorage';
import { EventService } from 'src/app/event.service';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: "js-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  public sidebarOpened: boolean = true;

  constructor(public appservice:AppService,public router:Router,
    public api:ApiService,
    private storage:LocalStorageService,public event:EventService) {
    if (this.router.getCurrentNavigation().extras.state) {
      let data = this.router.getCurrentNavigation().extras.state;
      console.log('main page in...');
      console.log(data);

      //chartPopulate


    }
  }

  ngOnInit(): void {

    this.api.populateData(0);


  }

  public sidebarToggle($event: any): void {
    this.sidebarOpened = !this.sidebarOpened;
  }



}

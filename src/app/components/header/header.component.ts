
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AppService } from "../../app.service";
import {LocalStorageService} from 'ngx-localstorage';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
@Component({
  selector: "js-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Output() toogleSidebarEvent: EventEmitter<any> = new EventEmitter();

  user;
  constructor(private appService: AppService,public storage: LocalStorageService,
    public router:Router,  public activatedroute: ActivatedRoute,
    ) {
      let prof=this.storage.get('profile');
      if(prof){
        this.prof_=JSON.parse(prof);
        if(this.prof_['uname']){
         this.user=this.prof_['uname'];
        }
      }
    }

    prof_;

  ngOnInit(): void {}

  public triggerToggleSidebar(): void {
    this.toogleSidebarEvent.emit();
    this.appService.triggerResizeEvent();
  }

  isLoggedIn;
  exitApp_lock;
  exitApp(){
    if(this.exitApp_lock)return;
    this.appService.delayExc(1700).then(_=>{this.exitApp_lock=false;});this.exitApp_lock=true;

    console.log('logout=>');

    this.isLoggedIn=null;
    this.storage.set("profile",null);
    this.storage.set("userToken",null);
    console.log('isLoggedIn=>'+this.isLoggedIn);

    let navigationExtras: NavigationExtras = {
      state: {isLoggedIn: this.isLoggedIn},replaceUrl:true//,skipLocationChange: true
      };
    this.router.navigate(['/login'],navigationExtras);

  }
}

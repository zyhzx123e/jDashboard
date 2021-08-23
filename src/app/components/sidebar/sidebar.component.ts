
import { Component, OnInit } from "@angular/core";
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-localstorage';
import { ApiService } from 'src/app/api.service';

@Component({
  selector: "js-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  constructor(public appservice:AppService,public router:Router,
    public api:ApiService,
    private storage:LocalStorageService) {
      let prof=this.storage.get('profile');
      if(prof){
        this.prof_=JSON.parse(prof);
        if(this.prof_['uname']){
         this.subtitle=this.prof_['uname'];
        }
      }
    }


  prof_;
  maintitle='Dashboard';
  subtitle='';//'zyh860@gmail.com';
  ngOnInit() {
    console.log('onSideBar init')
  }

  filter(index){
    if(index==0){
      //past 6 months
      console.log('filter past 6 months'+index);
      this.api.populateData(index);



    }else if(index==1){
      //past 6 days
      console.log('filter past 6 days'+index);
      this.api.populateData(index);


    }

  }

}

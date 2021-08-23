import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, NavigationExtras } from '@angular/router';
import { LocalStorageService } from 'ngx-localstorage';

import { ApiService } from 'src/app/api.service';


@Component({
  selector: 'js-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(public appservice:AppService,public router:Router,
      public api:ApiService,
    private storage:LocalStorageService)
    {
      if (this.router.getCurrentNavigation().extras.state) {
        let data = this.router.getCurrentNavigation().extras.state;
        console.log('login page in...');
        console.log(data);

      }
    }

  ngOnInit(): void {
    console.log('login page landed')
  }

  registerLink='First time login? Register Now';
  login_lock;
  login(){
    if(this.login_lock)return;
    this.appservice.delayExc(1000).then(_=>{this.login_lock=false;});this.login_lock=true;


    //validate start
    if(!this.login_uname){
      this.appservice.openAlertDialog('Please enter username');
      return;
    }
    if(!this.login_pswd || !this.login_pswd){
      this.appservice.openAlertDialog( 'Please complete the password');
      return;
    }

    if(this.login_uname && typeof this.login_uname=='string' && this.login_uname.length<6){
      this.appservice.openAlertDialog( 'Username length must be at least 6 characters');
      return;
    }
    if(this.login_pswd && typeof this.login_pswd=='string' && this.login_pswd.length<8){
      this.appservice.openAlertDialog( 'Password length must be at least 8 characters');
      return;
    }
    ///^([a-zA-Z0-9 _-]+)$/
    if(!/^([a-zA-Z0-9_-]+)$/.test(this.login_uname)){
      this.appservice.openAlertDialog( 'Username must be an alphanumeric text');
      return;
    }

    if(!/^([a-zA-Z0-9#!@$._-]+)$/.test(this.login_pswd)){
      this.appservice.openAlertDialog( 'Invalid character detected in password');
      return;
    }

    this.api.loginUser(this.login_uname,this.appservice.sha256_encrypt(this.login_pswd)).subscribe(d=>{
      if(d && d.status=='200' && d.token){
        //success
        //token
        this.storage.set('userToken',d.token);
        this.signIn(this.login_uname);
      }else if(d && d.status=='4000' ){
        this.appservice.openAlertDialog( 'Login failed');
      }else{
        this.appservice.openAlertDialog( 'Something went wrong, try again later');
      }
    },err=>{
      console.log(err)
      this.appservice.openAlertDialog(err.message?err.message:'Sorry, something went wrong, try again later');
    });

  }
  isLoggedIn;
  login_uname;
  login_pswd;

  signIn(uname){
    let ts_=this.appservice.getDateString();
    let ts_d=this.appservice.getCurrentDeviceDateTimeStr_withFormat('yyyy-MM-dd HH:mm:ss');
    console.log('login clicked:'+ts_);
    console.log('login clicked ts_d:'+ts_d);
    //{uname:uname,pswd:pswd}
    this.isLoggedIn={uname:uname,loginTime:ts_d};
    this.storage.set("profile",JSON.stringify(this.isLoggedIn));
    console.log('isLoggedIn=>',this.isLoggedIn);

    let navigationExtras: NavigationExtras = {
      state: {isLoggedIn: this.isLoggedIn},replaceUrl:true//,skipLocationChange: true
      };
      this.router.navigate(['/main'],navigationExtras);
  }


  isRegister=false;

  register_lock;
  register(){
    if(this.register_lock)return;
    this.appservice.delayExc(500).then(_=>{this.register_lock=false;});this.register_lock=true;

    this.isRegister=!this.isRegister;
    console.log('register clicked')
  }


  SignUp_lock;
  SignUp(){
    if(this.SignUp_lock)return;
    this.appservice.delayExc(1000).then(_=>{this.SignUp_lock=false;});this.SignUp_lock=true;


    //this.isRegister=false;
    if(!this.register_uname){
      this.appservice.openAlertDialog( 'Please enter username');
      return;
    }
    if(!this.register_pwd || !this.register_pwd_retype){
      this.appservice.openAlertDialog( 'Please complete the password');
      return;
    }

    if(this.register_uname && typeof this.register_uname=='string' && this.register_uname.length<6){
      this.appservice.openAlertDialog( 'Username length must be at least 6 characters');
      return;
    }
    if(this.register_pwd && typeof this.register_pwd=='string' && this.register_pwd.length<8){
      this.appservice.openAlertDialog( 'Password length must be at least 8 characters');
      return;
    }
    ///^([a-zA-Z0-9 _-]+)$/
    if(!/^([a-zA-Z0-9_-]+)$/.test(this.register_uname)){
      this.appservice.openAlertDialog( 'Username must be an alphanumeric text');
      return;
    }

    if(!/^([a-zA-Z0-9#!@$._-]+)$/.test(this.register_pwd)){
      this.appservice.openAlertDialog( 'Invalid character detected in password');
      return;
    }


    if(this.register_pwd_retype!=this.register_pwd){
      this.appservice.openAlertDialog( 'Please make sure both password entered are matched');
      return;
    }
    let hashed=this.appservice.sha256_encrypt(this.register_pwd);

    this.api.registerUser(this.register_uname,hashed).subscribe(res=>{
      console.log('register get result:',res);
      if(res.status=='4001'){//user exists
        this.appservice.openAlertDialog( 'Sorry, User['+this.register_uname+'] existed, please try user another username');
      }else if(res.status=='200'){//success

        if(res.token)this.storage.set('userToken',res.token);
        this.appservice.openAlertDialog( 'Congrats! welcome '+this.register_uname+'');
        this.signIn(this.register_uname);
      }else{//others
        this.appservice.openAlertDialog( 'Sorry, something went wrong, try again later');
      }
    },err=>{
      console.log(err)
      this.appservice.openAlertDialog(err.message?err.message:'Sorry, something went wrong, try again later');
    });

  }

  register_uname;
  register_pwd;
  register_pwd_retype;

}

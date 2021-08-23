import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot,Router, RouterStateSnapshot, UrlTree, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from 'ngx-localstorage';

@Injectable({
  providedIn: 'root'
})
export class CanActivateGuard implements CanActivate {
  constructor(private router: Router,   public localStorage:LocalStorageService) {

    console.log('CanActivateGuard constructor')
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    console.log(route);
    console.log('CanActivateGuard getprofile')
    return new Promise((resolve_,reject_)=>{
      let res_= this.localStorage.get("profile");
      if(res_ && typeof res_=='string'){
        let prof=JSON.parse(res_);
        if(prof['uname']) {
          resolve_(true);
        }else{
          this.directLogin();
          resolve_(false);
        }
        console.log('CanActivateGuard getprofile:',res_);

      }else{
        console.log('CanActivateGuard no profile found redirect user to login')
        this.directLogin();
        resolve_(false);
      }
    })


  }

  directLogin(){
    let navigationExtras: NavigationExtras = {
    state: {isLoggedIn: null},replaceUrl:true//,skipLocationChange: true
    };
    this.router.navigate(['/login'],navigationExtras);

  }

}

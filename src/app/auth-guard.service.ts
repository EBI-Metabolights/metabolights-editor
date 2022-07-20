import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { AuthService } from './services/metabolights/auth.service';
import { EditorService } from './services/editor.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './store';
import { assert } from 'console';
import { isInitialised } from './components/store';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private editorService: EditorService, private router: Router, private ngRedux: NgRedux<IAppState>) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string) {
    let isInitialised = this.ngRedux.getState().status['isInitialised'];
    // need to log out if evalsession comes back false.
    if(!isInitialised.ready && this.evaluateSession(isInitialised)){
      let localUser = localStorage.getItem('user');
      if(localUser != null && this.isJSON(localUser)){
        return this.editorService.initialise(localUser, false);
      }else{
        if(localUser != null){
          this.editorService.authenticateAPIToken({ "token" : localUser }).subscribe( res => {
            this.editorService.getValidatedJWTUser(res).subscribe( response => {
              this.editorService.initialise(response, true)
              return true;
            });
          }, err => {
            if(err.status == 403){
              return false;
            }
          })
        }else{
          this.editorService.redirectUrl = url;
          this.router.navigate(['/login']);
          return false;
        }
      }
    }else{
      return true;
    }
  }

  evaluateSession(isInitialisedObj: isInitialised) {
      let now = new Date();
      let then = isInitialisedObj.time as Date
      let sixHoursInMs = 21600000

      return (now.getTime() - then.getTime() > sixHoursInMs ? false : true)
  }

  isJSON(data) {
     var ret = true;
     try {
        JSON.parse(data);
     }catch(e) {
        ret = false;
     }
     return ret;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { AuthService } from './services/metabolights/auth.service';
import { EditorService } from './services/editor.service';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './store';
import { isInitialised } from './components/store';
import { SessionStatus } from './models/mtbl/mtbls/enums/session-status.enum';
import { environment } from 'src/environments/environment';
import { browserRefresh } from './app.component';

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

  /**
   * Checks whether a user is logged in.
   * @param url - url to be used a redirect if the user is found to be not logged in.
   * @returns boolean indicating whether the user is logged in.
   */
  checkLogin(url: string): boolean {
    let isInitialised = this.ngRedux.getState().status['isInitialised'];

    switch (this.evaluateSession(isInitialised)) {
      case SessionStatus.Active:
      //do some token verification  
        return true;

      case SessionStatus.Expired:
        // do some logging out / deactivating
        this.editorService.logout()
        return false;
        
      case SessionStatus.NotInit:
        // do some initialisation
        return this.editorService.initialise(localStorage.getItem('user'), false)

      case SessionStatus.NoRecord:
        this.editorService.redirectUrl = url;
        this.router.navigate(['/login']);
        return false;
        
      default:
        console.log('hit default case in checkLogin')
        this.editorService.redirectUrl = url;
        this.router.navigate(['/login']);
        return false;
        
    }



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

  /**
   * check whether a user has an open session, and if they do, whether it is still valid
   * @param isInitialisedObj Initialisation object from the state, which contains a timestamp of the session start.
   * @returns A SessionStatus enum value, indicating the status of the session. 
   */
  evaluateSession(isInitialisedObj: isInitialised): SessionStatus {

    // in app.component.ts we are subscribing to all router events, and recording when that event is NavigationStart, 
    // which will either be arriving at the app for the first time, or refreshing the page.
    let refreshed = browserRefresh;

      if (
        isInitialisedObj.ready === false && 
        (typeof isInitialisedObj.time === 'string' ) && 
        localStorage.getItem('user') === null
        ) {
        return SessionStatus.NoRecord
      }

      if (
        isInitialisedObj.ready === false && 
        this.isJSON(localStorage.getItem('user')) &&
        refreshed === false
         ) {
        return SessionStatus.NotInit
      }
      let now = new Date();
      let then = null

      if (localStorage.getItem('time') !== null){
        then = new Date(localStorage.getItem('time'))
      } else {
        return SessionStatus.NotInit
      }
      
      if(now.getTime() - then.getTime() > environment.sessionLength ) {
        return SessionStatus.Expired
      } else {
        return SessionStatus.Active
      }


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

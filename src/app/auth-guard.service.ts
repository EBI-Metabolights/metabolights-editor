import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
} from "@angular/router";
import { EditorService } from "./services/editor.service";
import { NgRedux } from "@angular-redux/store";
import { IAppState } from "./store";
import { IsInitialised } from "./components/store";
import { SessionStatus } from "./models/mtbl/mtbls/enums/session-status.enum";
import { ConfigurationService } from "./configuration.service";
import { HttpResponse } from "@angular/common/http";
import {browserRefresh} from './app.component';
import { select, Store } from "@ngrx/store";
import { selectIsInitialised } from "./state/meta-settings.selector";
import { of } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService,
    private router: Router,
    private ngRedux: NgRedux<IAppState>,
    private store: Store
  ) {}

  isInitialised$ = this.store.select(selectIsInitialised)
  destroy$ = of('null')

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(route, state);
  }

  /**
   * Checks whether a user is logged in.
   *
   * @param url - url to be used a redirect if the user is found to be not logged in.
   * @returns boolean indicating whether the user is logged in.
   */
  checkLogin(url: string): boolean {
    //let isInit = this.ngRedux.getState().status["isInitialised"]; // eslint-disable-line @typescript-eslint/dot-notation
    let isInit = null;
    let isInitSub = this.store.pipe(
      select(selectIsInitialised), takeUntil(this.destroy$)).subscribe(
      (isInitResp) => isInit = isInitResp
    );
    console.log(isInit);
    switch (this.evaluateSession(isInit)) {
      case SessionStatus.Active:
        if (browserRefresh) {
          return this.editorService.initialise(localStorage.getItem('user'), false);
        }
        return true;

      case SessionStatus.Expired:
        this.editorService.logout(false);
        return false;

      case SessionStatus.NotInit:
        const isUserJSON = this.isJSON(localStorage.getItem("user"));
        if (isUserJSON) {
          const user = JSON.parse(localStorage.getItem("user"));
          this.editorService
            .authenticateAPIToken({ token: user.apiToken, user })
            .subscribe((res: HttpResponse<any>) => {
              this.editorService
                .getValidatedJWTUser(res)
                .subscribe((jwtres) => {
                  this.router.navigate([this.editorService.redirectUrl]);
                  return this.editorService.initialise(jwtres, true);
                });
            });
        } else {
          this.editorService.logout(false);
        }
        break;

      case SessionStatus.NoRecord:
        this.editorService.redirectUrl = url;
        this.router.navigate(["/login"]);
        return false;

      default:
        console.log("hit default case in checkLogin");
        this.editorService.redirectUrl = url;
        this.router.navigate(["/login"]);
        return false;
    }
    this.destroy$.subscribe(res => {
      // this activates the takeUntil at the start of the method
    })
  }

  /**
   * check whether a user has an open session, and if they do, whether it is still valid
   *
   * @param isInitialisedObj Initialisation object from the state, which contains a timestamp of the session start.
   * @returns A SessionStatus enum value, indicating the status of the session.
   */
  evaluateSession(isInitialisedObj: IsInitialised): SessionStatus {
    // in app.component.ts we are subscribing to all router events, and recording when that event is NavigationStart,
    // which will either be arriving at the app for the first time, or refreshing the page.
    if (
      isInitialisedObj.ready === false &&
      typeof isInitialisedObj.time === "string" &&
      localStorage.getItem("user") === null
    ) {
      return SessionStatus.NoRecord;
    }

    const now = new Date();
    let then = null;

    const isUserJSON = this.isJSON(localStorage.getItem("user"));
    if (localStorage.getItem("time") !== null && isUserJSON) {
      then = new Date(localStorage.getItem("time"));
    } else {
      return SessionStatus.NotInit;
    }

    if (
      now.getTime() - then.getTime() >
      this.configService.config.sessionLength
    ) {
      return SessionStatus.Expired;
    } else {
      return SessionStatus.Active;
    }
  }

  isJSON(data) {
    let ret = true;
    try {
      JSON.parse(data);
    } catch (e) {
      ret = false;
    }
    return ret;
  }
}

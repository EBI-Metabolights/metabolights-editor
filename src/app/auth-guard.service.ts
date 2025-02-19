import { Injectable, OnInit } from "@angular/core";
import * as toastr from "toastr";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from "@angular/router";
import { EditorService } from "./services/editor.service";
import { SessionStatus } from "./models/mtbl/mtbls/enums/session-status.enum";
import { ConfigurationService } from "./configuration.service";

import jwtDecode from "jwt-decode";
import { MtblsJwtPayload } from "./services/headers";
import { HttpClient } from "@angular/common/http";

import { ErrorMessageService } from "./services/error-message.service";
import { Store } from "@ngxs/store";
import { StudyPermissionNS } from "./ngxs-store/non-study/application/application.actions";
@Injectable({
  providedIn: "root",
})
export class AuthGuard  implements OnInit {

  constructor(
    private editorService: EditorService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) { }


  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const url: string = state.url;
    const continueProcess = await this.checkAuthenticationRequest(state);
    if (continueProcess === false) {
      // if the user is not authenticated, but there is a private MTBLS acc in the url,
      // we want them to be able to access it.
      //const __ = this.privateMTBLSHandler(url, state);
      return false;
    }
    return await this.checkUrlAndLogin(url, state);
  }

  // this will either redirect, or return false to indicate its not a private MTBLS request
  async privateMTBLSHandler(url: string, state: RouterStateSnapshot) {
    console.log('if this log is not found we have a problem')
    if (url.startsWith("/MTBLS")) {
      console.log('are we starting the privateMTBLSHandler method?')
      const studyIdentifier = url.split("/")[1];
      const regEx = new RegExp('^(MTBLS[1-9][0-9]{0,10})($|\\?)', 'g');
      const studyIdResults = studyIdentifier.match(regEx);
      if (studyIdResults === null || studyIdResults.length === 0) {
        console.log('uh oh')
        this.editorService.redirectUrl = url;
        const errorCode = "E-0001-003";
        this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
        return false;
      }
      const studyPermission = await this.editorService.getStudyPermissionByStudyId(studyIdentifier);
      if (studyPermission.studyId === studyIdentifier) {
        console.log('hitting study not public router call');
        console.trace();
        this.editorService.redirectUrl = url;
        this.router.navigate(["/study-not-public"]);
        //return false;
      }


    }
    return false;

  }

  async checkAuthenticationRequest(state: RouterStateSnapshot) {
    try {
      let loginOneTimeToken = null;
      if (state.root.queryParamMap.has("loginOneTimeToken") === false) {
        console.log('first if clause in auth guard');
        const __ = this.privateMTBLSHandler(state.url, state);
        return true;
      }

      loginOneTimeToken = state.root.queryParamMap.get("loginOneTimeToken");
      this.editorService.updateHistory(state.root);
      if (loginOneTimeToken === "") {
        this.editorService.redirectUrl = state.url;
        // if the user is not authenticated, but there is a private MTBLS acc in the url,
        // we want them to be able to access it.
        const __ = this.privateMTBLSHandler(state.url, state);
        this.router.navigate(["/login"]);
        return false;
      }

      const localLoginOneTimeToken = localStorage.getItem("loginOneTimeToken");

      if (localLoginOneTimeToken === loginOneTimeToken) {
        return true;
      }
      const jwt = await this.editorService.getJwtWithOneTimeToken(loginOneTimeToken);
      let decoded = null;
      try {
        decoded = jwtDecode<MtblsJwtPayload>(jwt);
      } catch (err) {
      }
      if (decoded === null) {
        this.editorService.redirectUrl = state.url;
        // if the user is not authenticated, but there is a private MTBLS acc in the url,
        // we want them to be able to access it.
        const __ = this.privateMTBLSHandler(state.url, state);
        this.router.navigate(["/login"]);
        return false;
      }

      const localJwt = localStorage.getItem("jwt");

      if (localJwt !== null && jwt === localJwt) {
        return true;
      }

      const userName = decoded.sub;

      if (localJwt === null) {
        this.editorService.redirectUrl = state.url;
        await this.editorService.loginWithJwt(jwt, userName);
        localStorage.setItem("loginOneTimeToken", loginOneTimeToken);
        toastr.success(userName + "is logged in successfully.", "Metabolights Editor session is activated.", {
          timeOut: "5000",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      } else {
        let localDecoded = null;
        try {
          localDecoded = jwtDecode<MtblsJwtPayload>(localJwt);
        } catch (err) {
        }
        const currentUser = localDecoded.sub;
        if (currentUser !== userName) {
          this.editorService.clearSessionData();
          await this.editorService.loginWithJwt(jwt, userName);
          toastr.info("User: " + userName, "Session is switched to other user.", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
      }
      return true;
    } catch (err) {
      this.editorService.redirectUrl = state.url;
      const errorCode = "E-0001-001";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }
  }

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return await this.canActivate(route, state);
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  ngOnInit(): void {
  }

  /**
   * Checks whether a user is logged in or view file.
   *
   * @param url - url to be used a redirect if the user is found to be not logged in.
   * @returns boolean indicating whether the user is logged in.
   */
  async checkUrlAndLogin(url: string, state: RouterStateSnapshot) {
    console.log(`${state.url}`)
    const localJwt = localStorage.getItem("jwt");
    if (url.startsWith("/login")) {
      if (localJwt !== null) {
        this.router.navigate(["/console"]);
        return false;
      } else {
        return true;
      }
    }
    let studyIdentifier = null;
    let obfuscationCode = null;
    if (url.startsWith("/MTBLS")) {
      studyIdentifier = url.split("/")[1];
    }if (url.startsWith("/REQ")) {
      studyIdentifier = url.split("/")[1];
    }else if (url.startsWith("/study/MTBLS")) {
      studyIdentifier = url.split("/")[2];
    }else if (url.startsWith("/study/REQ")) {
      studyIdentifier = url.split("/")[2];
    } else if (url.startsWith("/reviewer")) {
      obfuscationCode = url.split("/")[1].replace("reviewer", "");
    } else if (url.startsWith("/study/")) {
      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-001";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }

    if (studyIdentifier !== null) {
      return await this.checkStudyUrl(url, studyIdentifier, state);
    } else if (obfuscationCode !== null) {
      return await this.checkStudyObfuscationCode(url, obfuscationCode, state, null);
    }
    if (url === '/study/MTBLS9058') {
      console.log('getting to this point without redirection')
    }
    switch (this.evaluateSession(null)) {
      case SessionStatus.Active:
        return true;

      case SessionStatus.Expired:
        this.editorService.redirectUrl = url;
        this.editorService.logout(false);
        return false;

      case SessionStatus.NotInit:
        this.editorService.redirectUrl = url;
        await this.editorService.updateSession();
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
  }
  async checkStudyObfuscationCode(url: string, obfuscationCode: string, state: RouterStateSnapshot, studyId: string) {
    const studyPermission = await this.editorService.getStudyPermissionByObfuscationCode(obfuscationCode);
    const permissions = studyPermission;
    this.store.dispatch(new StudyPermissionNS.Set(permissions))
    if (studyPermission === null || studyPermission.studyId === "") {
      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }
    if (studyId !== null && studyId !== studyPermission.studyId) {
      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }
    if (url.startsWith("/reviewer")) {

      if (studyPermission.view) {
        if (url.startsWith("/reviewer")) {
          const params = { reviewCode: obfuscationCode };
          this.router.navigate(["/" + studyPermission.studyId + "/files"], { queryParams: params });
          return false;
        }

        return true;
      }
    }
    if (studyPermission.view) {
      if (url.startsWith("/reviewer")) {
        const params = { reviewCode: obfuscationCode };
        this.router.navigate(["/" + studyPermission.studyId + "/files"], { queryParams: params });
        return false;
      } else if (url.startsWith("/MTBLS")) {

      }
      const permissions = studyPermission;
      this.store.dispatch(new StudyPermissionNS.Set(permissions))
      return true;
    }
    return false;
  }

  async checkStudyUrl(url: string, studyId: string, state: RouterStateSnapshot) {
    const regEx = new RegExp('^((MTBLS[1-9][0-9]{0,10})|(REQ[0-9]{1,20}))($|\\?)', 'g');
    const studyIdResults = studyId.match(regEx);
    if (studyIdResults === null || studyIdResults.length === 0) {
        this.editorService.redirectUrl = url;
        const errorCode = "E-0001-003";
        this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
        return false;
    }

    let studyIdentifier = studyIdResults[0];
    if (studyIdentifier.endsWith("?")) {
      studyIdentifier = studyIdResults[0].slice(0, -1);
    }
    const studyPermission = await this.editorService.getStudyPermissionByStudyId(studyIdentifier);
    if (studyPermission === null || studyPermission.studyId === "") {
      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }

    const isPublic = studyPermission.studyStatus.toUpperCase() === "PUBLIC";
    if (url.startsWith("/MTBLS")) {
      const isCurator = localStorage.getItem("isCurator");

      if (isPublic || studyPermission.submitterOfStudy || (isCurator && isCurator.toLowerCase() === "true")) {
        const permissions = studyPermission;
        this.store.dispatch(new StudyPermissionNS.Set(permissions))
        return true;
      }
      const reviewCode = state.root.queryParams.reviewCode;
      if (reviewCode) {
        return await this.checkStudyObfuscationCode(url, reviewCode, state, studyId);
      }

      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-004";
      console.log("we don't actualy want to be getting here")
      //this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      const __ = this.privateMTBLSHandler(url, state);
      return false;
    } else {
      if (studyPermission.edit) {
        const permissions = studyPermission;
        this.store.dispatch(new StudyPermissionNS.Set(permissions))
        return true;
      } else {
        if (studyPermission.submitterOfStudy === true && studyPermission.view === true && url.startsWith("/study/MTBLS")) {
          this.editorService.redirectUrl = url;
          this.router.navigate([url.replace("/study","")]);
          return false;
        }
        if (studyPermission.userName == null || studyPermission.userName.length === 0) {
          console.log('finally getting here')
          const __ = this.privateMTBLSHandler(url, state);
          this.editorService.redirectUrl = url;
          this.router.navigate(["/login"]);
        } else {
          this.editorService.redirectUrl = url;
          const errorCode = "E-0001-004";
          this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
        }
        return false;
      }
    }

  }

  /**
   * check whether a user has an open session, and if they do, whether it is still valid
   *
   * @param isInitialisedObj Initialisation object from the state, which contains a timestamp of the session start.
   * @returns A SessionStatus enum value, indicating the status of the session.
   */
  evaluateSession(isInitialisedObj: any): SessionStatus {
    // in app.component.ts we are subscribing to all router events, and recording when that event is NavigationStart,
    // which will either be arriving at the app for the first time, or refreshing the page.
    // if (
    //   isInitialisedObj.ready === false &&
    //   typeof isInitialisedObj.time === "string" &&
    //   localStorage.getItem("user") === null
    // ) {
    //   return SessionStatus.NoRecord;
    // }

    if (localStorage.getItem("jwt") === null) {
      return SessionStatus.NoRecord;
    }

    if (localStorage.getItem("user") === null) {
      return SessionStatus.NotInit;
    }

    const now = new Date();
    const jwtExpirationTime = localStorage.getItem("jwtExpirationTime");
    let then;

    if (jwtExpirationTime == null) {
      const decoded = jwtDecode<MtblsJwtPayload>(localStorage.getItem("jwt"));
      const expiration = decoded.exp;
      localStorage.setItem("jwtExpirationTime", expiration.toString());
      then = new Date(expiration * 1000);
    } else {
      then = new Date(Number(jwtExpirationTime) * 1000);
    }
    const nowTime = now.getTime();
    const thenTime = then.getTime();
    if (nowTime > thenTime) {
      return SessionStatus.Expired;
    } else {
      return SessionStatus.Active;
    }

    return SessionStatus.Active;
  }
}

import { Injectable, OnInit } from "@angular/core";
import * as toastr from "toastr";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from "@angular/router";
import { EditorService } from "./services/editor.service";
import { SessionStatus } from "./models/mtbl/mtbls/enums/session-status.enum";
import { ConfigurationService } from "./configuration.service";

import { httpOptions, MtblsJwtPayload, StudyPermission } from "./services/headers";
import { HttpClient } from "@angular/common/http";

import { ErrorMessageService } from "./services/error-message.service";
import { environment } from "src/environments/environment";
import { Store } from "@ngxs/store";
import { StudyPermissionNS } from "./ngxs-store/non-study/application/application.actions";
import { KeycloakAuthGuard, KeycloakEventType, KeycloakService } from "keycloak-angular";
import { firstValueFrom } from "rxjs";
import { StudyRedirectHandlerService } from "./services/study-redirect-handler.service";
import jwtDecode from "jwt-decode";
@Injectable({
  providedIn: "root",
})
export class AuthGuard extends KeycloakAuthGuard implements OnInit {
  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService,
    protected router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService,
    private store: Store,
    protected readonly keycloak: KeycloakService,
    private redirectHandler: StudyRedirectHandlerService
  ) {
    super(router, keycloak)
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (state.url.startsWith("/console")) {
      if (!this.authenticated) {
        this.editorService.setRedirectUrl(state.url);
        await this.keycloak.login();
        return false;
      }
      return true;
    }

    if (state.url.startsWith('/login')) {
      return true;
    }

    // Delegate ALL study-related redirect logic to the new handler
    return await this.redirectHandler.handleRedirectFlow(state.url);
  }

  async cccanActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ) {
    return await this.isAccessAllowed(route, state);
  }

  async handlePrivate(studyIdentifier): Promise<boolean> {
    const perms = await this.editorService.getStudyPermissionByStudyId(studyIdentifier);
    return perms.view === null || !perms.view
  }

  async ccanActivateChild(
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
  async checkUrlAndLogin(url: string, state: RouterStateSnapshot, isPrivateWithMTBLSAccession: boolean) {
    // const jwtTokenKey = this.configService.config.endpoint + "/jwt"
    const jwtTokenKey = "jwt"
    
    const localJwt = localStorage.getItem(jwtTokenKey);
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
    } else if (url.startsWith("/REQ")) {
      studyIdentifier = url.split("/")[1];
    } else if (url.startsWith("/study/MTBLS")) {
      studyIdentifier = url.split("/")[2];
    } else if (url.startsWith("/study/guide/")) {
      studyIdentifier = url.split("/")[3];
    } else if (url.startsWith("/study/REQ")) {
      studyIdentifier = url.split("/")[2];
    } else if (url.startsWith("/reviewer")) {
      obfuscationCode = url.split("/")[1].split("?")[0].replace("reviewer", "");
    } else if (url.startsWith("/study/")) {
      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-001";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }

    if (studyIdentifier !== null) {
      return await this.checkStudyUrl(url, studyIdentifier, state, isPrivateWithMTBLSAccession);
    } else if (obfuscationCode !== null) {
      return await this.checkStudyObfuscationCode(url, obfuscationCode, state, null);
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

  async checkStudyUrl(url: string, studyId: string, state: RouterStateSnapshot, isPrivateWithMTBLSAccession: boolean) {
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
    } else if (studyPermission.studyId !== studyIdentifier) {
      this.editorService.redirectUrl = `/study/${studyPermission.studyId}/descriptors`;
      this.router.navigate([this.editorService.redirectUrl]);
      return false;
    }

    const isPublic = studyPermission.studyStatus.toUpperCase() === "PUBLIC";
    const isCurator = studyPermission.userRole == "ROLE_SUPER_USER";
    if (url.startsWith("/MTBLS")) {
      const isCuratorKey = this.configService.config.endpoint + "/isCurator"

      if (isPublic || studyPermission.submitterOfStudy || isCurator) {
        const permissions = studyPermission;
        this.store.dispatch(new StudyPermissionNS.Set(permissions))
        return true;
      }
      const reviewCode = state.root.queryParams.reviewCode;
      if (reviewCode) {
        return await this.checkStudyObfuscationCode(url, reviewCode, state, studyId);
      }
      if (isPrivateWithMTBLSAccession) {
        this.editorService.redirectUrl = url;
        this.router.navigate(["/study-not-public"], { queryParams: { studyIdentifier: studyIdentifier } });
        return false;
      }

      this.editorService.redirectUrl = url;
      const errorCode = "E-0001-004";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    } else {
      if (studyPermission.submitterOfStudy || isCurator) {
        const permissions = studyPermission;
        this.store.dispatch(new StudyPermissionNS.Set(permissions))
        return true;
      } else {
        if (url.startsWith("/study/MTBLS") && studyPermission.view === false ){
          this.editorService.redirectUrl = url;
          const errorCode = "E-0001-004";
          if (isPrivateWithMTBLSAccession){
            this.router.navigate([url.replace("/study/", "/")]);
            return false
          }
          this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
          return false
        }
        if (studyPermission.submitterOfStudy === true && studyPermission.view === true && url.startsWith("/study/MTBLS")) {
          this.editorService.redirectUrl = url;
          this.router.navigate([url.replace("/study","")]);
          return false;
        }
        if (studyPermission.userName == null || studyPermission.userName.length === 0) {
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
    //   localStorage.getItem(userKey) === null
    // ) {
    //   return SessionStatus.NoRecord;
    // }
    // const jwtTokenKey = this.configService.config.endpoint + "/jwt"
    const jwtTokenKey = "jwt"
    const userKey = this.configService.config.endpoint + "/user"
    const jwtExpirationTimeKey = this.configService.config.endpoint + "/jwtExpirationTime"
    if (localStorage.getItem(jwtTokenKey) === null) {
      return SessionStatus.NoRecord;
    }

    if (localStorage.getItem(userKey) === null) {
      return SessionStatus.NotInit;
    }

    const now = new Date();
    const jwtExpirationTime = localStorage.getItem(jwtExpirationTimeKey);
    let then;

    if (jwtExpirationTime == null) {
      const decoded = jwtDecode<MtblsJwtPayload>(localStorage.getItem(jwtTokenKey));
      const expiration = decoded.exp;
      
      localStorage.setItem(jwtExpirationTimeKey, expiration.toString());
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

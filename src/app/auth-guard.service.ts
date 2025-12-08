import { Injectable, OnInit } from "@angular/core";
import * as toastr from "toastr";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from "@angular/router";
import { EditorService } from "./services/editor.service";
import { SessionStatus } from "./models/mtbl/mtbls/enums/session-status.enum";
import { ConfigurationService } from "./configuration.service";

import { httpOptions, StudyPermission } from "./services/headers";
import { HttpClient } from "@angular/common/http";

import { ErrorMessageService } from "./services/error-message.service";
import { environment } from "src/environments/environment";
import { Store } from "@ngxs/store";
import { StudyPermissionNS } from "./ngxs-store/non-study/application/application.actions";
import { KeycloakAuthGuard, KeycloakEventType, KeycloakService } from "keycloak-angular";
import { firstValueFrom } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class AuthGuard  extends KeycloakAuthGuard implements OnInit{
  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService,
    protected router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private errorMessageService: ErrorMessageService,
    private store: Store,
    protected readonly keycloak: KeycloakService
  ) {
      super(router, keycloak)
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  )
  {
    if (!this.authenticated) {
      this.editorService.setRedirectUrl(state.url);
      this.keycloak.login()
      return false;
    }
    if(this.authenticated && state.url.startsWith("/console")) {
      return true
    }
    if (this.authenticated) {
      const canAccess = await this.checkUrlAndLogin(state.url, state, false);
      this.editorService.setRedirectUrl(state.url);
      return canAccess;
    }
    return false

  }

  async cccanActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  )
  {
    const url: string = state.url;
    let studyIdentifier;
    let isPrivateWithMTBLSAccession = false;
    if (url.startsWith("/MTBLS")) {
      studyIdentifier = url.split("/")[1];
      isPrivateWithMTBLSAccession = await this.handlePrivate(studyIdentifier)
    }
    else if (url.startsWith("/study/MTBLS")) {
      studyIdentifier = url.split("/")[2];
      isPrivateWithMTBLSAccession = await this.handlePrivate(studyIdentifier)
    }
    // const continueProcess = await this.checkAuthenticationRequest(state);
    // if (continueProcess === false) {
    //   if (isPrivateWithMTBLSAccession) this.router.navigate(["/study-not-public"], { queryParams: { studyIdentifier: studyIdentifier } });
    //   return false;
    // }
    return await this.checkUrlAndLogin(url, state, isPrivateWithMTBLSAccession);
  }

  async handlePrivate(studyIdentifier): Promise<boolean> {
    const perms = await this.editorService.getStudyPermissionByStudyId(studyIdentifier);
    return perms.view === null || !perms.view
    // const allEmptyOrFalse = (obj: Record<string, any>): boolean =>
    //   Object.entries(obj)
    //     .filter(([key]) => key !== 'studyId')       // skip studyId
    //     .every(([, val]) => val === '' || val === false);
    // const priv = allEmptyOrFalse(perms)
    // console.log(priv);
    // return priv;
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
      obfuscationCode = url.split("/")[1].split("?")[0].replace("reviewer", "");
    } else if (url.startsWith("/study/")) {
      this.editorService.setRedirectUrl(url);
      const errorCode = "E-0001-001";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }

    const baseUrl = this.configService.config.metabolightsWSURL.baseURL;
    let permissionUrl = null
    if (studyIdentifier) {
      permissionUrl = baseUrl + "/auth/permissions/accession-number/" + studyIdentifier;
    } else {
      permissionUrl = baseUrl + "/auth/permissions/obfuscationcode/" + obfuscationCode;
    }
    if (permissionUrl === null) {
      return false;
    }
    const studyPermission =  await firstValueFrom(this.http.get<StudyPermission>(permissionUrl,
      {
        headers: httpOptions.headers,
        observe: "body",
      }
    ));
    // this.store.dispatch(new StudyPermissionNS.Set(studyPermission))

    if (!studyPermission.studyId) {
      this.editorService.setRedirectUrl(url);
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }
    if (studyPermission.view) {
      if (url.startsWith("/reviewer")) {
        const params = { reviewCode: obfuscationCode };
        this.router.navigate(["/" + studyPermission.studyId + "/files"], { queryParams: params });
        return false;
      }
      return true;
    }
    return false;

  }
  async checkStudyObfuscationCode(url: string, obfuscationCode: string, state: RouterStateSnapshot, studyId: string) {
    const studyPermission = await this.editorService.getStudyPermissionByObfuscationCode(obfuscationCode);
    const permissions = studyPermission;
    this.store.dispatch(new StudyPermissionNS.Set(permissions))
    if (studyPermission === null || studyPermission.studyId === "") {
      this.editorService.setRedirectUrl(url)
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
      return false;
    }
    if (studyId !== null && studyId !== studyPermission.studyId) {
      this.editorService.setRedirectUrl(url)
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
        this.editorService.setRedirectUrl(url)
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
      this.editorService.setRedirectUrl(url)
      const errorCode = "E-0001-002";
      this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
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
        this.editorService.setRedirectUrl(url)
        this.router.navigate(["/study-not-public"], { queryParams: { studyIdentifier: studyIdentifier } });
        return false;
      }

      this.editorService.setRedirectUrl(url)
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
          this.editorService.setRedirectUrl(url)
          const errorCode = "E-0001-004";
          if (isPrivateWithMTBLSAccession){
            this.router.navigate([url.replace("/study/", "/")]);
            return false
          }
          this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
          return false
        }
        if (studyPermission.submitterOfStudy === true && studyPermission.view === true && url.startsWith("/study/MTBLS")) {
          this.editorService.setRedirectUrl(url)
          this.router.navigate([url.replace("/study","")]);
          return false;
        }
        if (studyPermission.userName == null || studyPermission.userName.length === 0) {
          this.editorService.setRedirectUrl(url)
          this.router.navigate(["/login"]);
        } else {
          this.editorService.setRedirectUrl(url)
          const errorCode = "E-0001-004";
          this.router.navigate(["/study-not-found"], { queryParams: { code: errorCode } });
        }
        return false;
      }
    }

  }

}

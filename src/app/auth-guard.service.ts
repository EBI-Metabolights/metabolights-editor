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
import { StudyRedirectHandlerService } from "./services/study-redirect-handler.service";
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
}

import { Component, ViewEncapsulation, ElementRef, OnInit } from "@angular/core";
import { EditorService } from "./services/editor.service";
import { Observable, Subscription, firstValueFrom } from "rxjs";
import { NavigationStart, Router, RouterEvent } from "@angular/router";
import jwtDecode from "jwt-decode";
import { MtblsJwtPayload } from "./services/headers";
import { Store } from "@ngxs/store";
import { environment } from "src/environments/environment";
import { AuthService } from "./services/auth.service";
import { BackendVersion, EditorVersion } from "./ngxs-store/non-study/application/application.actions";
import { KeycloakEventType, KeycloakService } from "keycloak-angular";
import { Owner, User } from "./ngxs-store/non-study/user/user.actions";
import { SetLoadingInfo } from "./ngxs-store/non-study/transitions/transitions.actions";

export let browserRefresh = false;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  subscription: Subscription;
  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private editorService: EditorService,
    private store: Store,
    private keycloak: KeycloakService,
    private authService: AuthService
  ) {

    this.subscription = router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }
  async ngOnInit() {

    const url = this.router.routerState.snapshot.url || window.location.pathname;
    this.editorService.setRedirectUrl(url);

    // If already logged in (e.g. page refresh), sync immediately
    const loggedIn = await this.keycloak.isLoggedIn();
    if (loggedIn) {
      await this.syncUserProfile();
    }

    // Sync Keycloak session with MetaboLights backend profile on new login events
    this.keycloak.keycloakEvents$.subscribe(async (event) => {
      if (
        event.type === KeycloakEventType.OnAuthSuccess ||
        event.type === KeycloakEventType.OnAuthRefreshSuccess
      ) {
        const isLoggedIn = await this.keycloak.isLoggedIn();
        if (isLoggedIn) {
          await this.syncUserProfile();
        }
      }
    });
  }

  private async syncUserProfile() {
    try {
      const token = await this.keycloak.getToken();
      // Store the token immediately so the HeaderInterceptor can pick it up
      this.authService.storeTokens({ access_token: token, refresh_token: '' });

      const profile = await this.keycloak.loadUserProfile();

      // Clear any stale apiToken to prevent HeaderInterceptor from sending it
      // and causing a 500 error on the /user endpoint in normal browser tabs
      this.authService.clearApiToken();

      const user: any = await firstValueFrom(this.editorService.getAuthenticatedUser(token, profile.username));


      if (user && user.content) {
        const owner: Owner = {
          apiToken: user.content.apiToken,
          role: user.content.role,
          email: user.content.email || profile.email || profile.username || 'Unknown',
          status: user.content.status || 'ACTIVE',
          partner: user.content.partner || false,
          firstName: user.content.firstName || profile.firstName,
          lastName: user.content.lastName || profile.lastName,
          affiliation: user.content.affiliation || '',
          address: user.content.address || '',
          orcid: user.content.orcid || profile.attributes?.orcid?.[0] || '',
          globus_username: user.content.globus_username || profile.attributes?.globus_username?.[0] || '',
        };
        this.store.dispatch(new User.Set(owner));

        const decodedToken: any = jwtDecode(token);
        const isCurator = user.content.role === 1 || decodedToken.role === 1 || false;

        this.authService.storeUserLocalStorage({
          apiToken: user.content.apiToken,
          isCurator: isCurator,
          user: user.content.email || profile.email,
          username: profile.username,
          jwtExpirationTime: decodedToken.exp
        });
      } else {
        // Fallback if backend doesn't return user profile
        const decodedToken: any = jwtDecode(token);
        const isCurator = decodedToken.role === 1 || false;
        const owner: Owner = {
          apiToken: '', // We don't have the API token yet if backend failed
          role: isCurator ? 1 : 2,
          email: profile.email || decodedToken.email || profile.username || 'Unknown',
          status: 'ACTIVE',
          partner: decodedToken.partner || false,
          firstName: profile.firstName || decodedToken.given_name,
          lastName: profile.lastName || decodedToken.family_name,
        };
        this.store.dispatch(new User.Set(owner));

        this.authService.storeUserLocalStorage({
          isCurator: isCurator,
          user: owner.email,
          username: profile.username || decodedToken.name,
          jwtExpirationTime: decodedToken.exp
        });
      }
    } catch (error) {
      console.error("Failed to sync user profile:", error);
    }

    // Always update session (even if unauthenticated) but wait forauth status to resolve
    await this.editorService.updateSession();
  }

  // const jwt = this.elementRef.nativeElement.getAttribute("mtblsjwt");
  // const user = this.elementRef.nativeElement.getAttribute("mtblsuser");

  // // const isOwner = this.elementRef.nativeElement.getAttribute("isOwner");
  // // const isCurator = this.elementRef.nativeElement.getAttribute("isCurator");

  // const mtblsid = this.elementRef.nativeElement.getAttribute("mtblsid");
  // const obfuscationcode =
  //   this.elementRef.nativeElement.getAttribute("obfuscationcode");
  // const redirectUrl = this.editorService.getRedirectUrl();
  // const url = this.router.routerState.snapshot.url
  // if (redirectUrl){

  //   if (url === "/login" ){
  //     this.router.navigate([redirectUrl]);
  //   } else {
  //     this.editorService.setRedirectUrl(url);
  //   }
  //   return;
  // }
  // if (jwt && jwt !== "" && user && user !== "") {
  //   localStorage.setItem("mtblsuser", user);
  //   localStorage.setItem("mtblsjwt", jwt);
  // } else if (
  //   mtblsid &&
  //   mtblsid !== "" &&
  //   obfuscationcode &&
  //   obfuscationcode !== ""
  // ) {
  //   localStorage.setItem("mtblsid", mtblsid);
  //   localStorage.setItem("obfuscationcode", obfuscationcode);
  // } else {
  //   localStorage.removeItem("mtblsjwt");
  //   localStorage.removeItem("mtblsuser");
  // }
  //  this.store.dispatch(new GuidesMappings.Get()); // to load the guides we first load the mappings

}

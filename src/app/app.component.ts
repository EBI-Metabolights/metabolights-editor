import { Component, ViewEncapsulation, ElementRef, OnInit } from "@angular/core";
import { EditorService } from "./services/editor.service";
import { Subscription } from "rxjs";
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

    await this.editorService.updateSession();

    const url = this.router.routerState.snapshot.url;
    this.editorService.setRedirectUrl(url);

    // Sync Keycloak session with MetaboLights backend profile
    this.keycloak.keycloakEvents$.subscribe(async (event) => {
      if (
        event.type === KeycloakEventType.OnAuthSuccess ||
        event.type === KeycloakEventType.OnAuthRefreshSuccess ||
        event.type === KeycloakEventType.OnReady
      ) {
        const loggedIn = await this.keycloak.isLoggedIn();
        if (loggedIn) {
          try {
            const profile = await this.keycloak.loadUserProfile();
            const token = await this.keycloak.getToken();
            
            this.editorService.getAuthenticatedUser(token, profile.username).subscribe((user) => {
              const owner: Owner = {
                apiToken: user.apiToken,
                role: user.role,
                email: user.email || profile.email || profile.username || 'Unknown',
                status: user.status || 'ACTIVE',
                partner: user.partner || false,
                firstName: user.firstName || profile.firstName,
                lastName: user.lastName || profile.lastName,
              };
              this.store.dispatch(new User.Set(owner));
              this.authService.storeApiToken(user.apiToken);
            });
          } catch (error) {
            console.error("Failed to sync user profile:", error);
          }
        }
      }
    });

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


}

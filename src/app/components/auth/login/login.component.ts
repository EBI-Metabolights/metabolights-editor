import { Component, effect, inject, OnInit } from "@angular/core";
// import { AuthService } from "./../../../services/metabolights/auth.service";
import { EditorService } from "./../../../services/editor.service";
// import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
// import { environment } from "src/environments/environment";
// import { ConfigurationService } from "src/app/configuration.service";
// import { MtblsJwtPayload } from "src/app/services/headers";
// import jwtDecode  from "jwt-decode";
// import * as toastr from "toastr";
// import {PlatformLocation} from '@angular/common';
import { Store } from "@ngxs/store";
import { Loading, SetLoadingInfo } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { KeycloakEventType, KeycloakService } from "keycloak-angular";
import { User } from "src/app/ngxs-store/non-study/user/user.actions";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  // form: UntypedFormGroup;
  // isFormBusy = false;
  // invalidCredentials = false;
  // domain = "";
  // endpoint: string;
  // baseHref: string;
  // environmentName: string;
  constructor(
    // private fb: UntypedFormBuilder,
    private store: Store,
    public router: Router,
    private editorService: EditorService,
    // private configService: ConfigurationService,
    // private platformLocation: PlatformLocation,
    private readonly keycloak: KeycloakService
  ) {
    // this.baseHref = this.configService.baseHref;
    // this.environmentName = this.platformLocation.getBaseHrefFromDOM();
    // this.environmentName = this.environmentName.replace("/metabolights", "");
    // this.environmentName = this.environmentName.replace("/editor", "");
    // this.environmentName = this.environmentName.replace("/", "");
    this.keycloak.keycloakEvents$.subscribe(event => {
      switch (event.type) {

        case KeycloakEventType.OnAuthSuccess:
          this.router.navigate([this.editorService.getRedirectUrl()]);
          break;

        case KeycloakEventType.OnAuthRefreshSuccess:
          this.router.navigate([this.editorService.getRedirectUrl()]);
          break;

        case KeycloakEventType.OnAuthRefreshError:
          break;

        case KeycloakEventType.OnAuthLogout:
          break;

        case KeycloakEventType.OnTokenExpired:
          this.keycloak.updateToken(20);
          break;

        case KeycloakEventType.OnReady:
          break;
      }
    });
  }

  async ngOnInit() {
    this.store.dispatch(new Loading.Disable())
  }

    // this.form = this.fb.group({
    //   email: ["", [Validators.required, Validators.email]],
    //   secret: ["", Validators.required],
    // });
    // this.endpoint = this.configService.config.endpoint;
    // if (this.endpoint.endsWith("/") === false){
    //   this.endpoint = this.endpoint + "/";
    // }


  // resetForm() {
  //   this.form.reset();
  //   this.invalidCredentials = false;
  // }


  // login(event) {
  //   event.preventDefault();
  //   this.isFormBusy = true;
  //   this.invalidCredentials = false;

  //   if (this.form.invalid) {
  //     if (this.form.get("email").value && this.form.get("email").value !== "") {
  //       this.form.controls.email.markAsTouched();
  //     }
  //     if (
  //       this.form.get("secret").value &&
  //       this.form.get("secret").value !== ""
  //     ) {
  //       this.form.controls.secret.markAsTouched();
  //     }
  //     this.isFormBusy = false;
  //     return;
  //   }

  //   const body = {
  //     email: this.form.get("email").value,
  //     secret: this.form.get("secret").value,
  //   };
  //   this.editorService.login(body).subscribe(
  //     (response) => {
  //       this.editorService.getValidatedJWTUser(response).subscribe((data) => {
  //         const jwt = response.headers.get("Jwt");
  //         const refreshToken = response.headers.get("Refresh-Token");
  //         const decoded = jwtDecode<MtblsJwtPayload>(jwt);
  //         const expiration = decoded.exp;
  //         const user = decoded.email;
  //         const jwtTokenKey = this.configService.config.endpoint + "/jwt"
  //         const refreshTokenKey = this.configService.config.endpoint + "/refreshToken"

  //         const jwtExpirationTimeKey = this.configService.config.endpoint + "/jwtExpirationTime"
  //         if (refreshTokenKey) {
  //             localStorage.setItem(refreshTokenKey, refreshToken);
  //         }
  //         localStorage.setItem(jwtTokenKey, jwt);

  //         localStorage.setItem(jwtExpirationTimeKey, expiration.toString());
  //         // this.editorService.initialise(data, true);
  //         toastr.success(user + " logged in successfully.", "Successful login", {
  //           timeOut: "5000",
  //           positionClass: "toast-top-center",
  //           preventDuplicates: true,
  //           extendedTimeOut: 0,
  //           tapToDismiss: false,
  //         });
  //         this.router.navigate([this.editorService.redirectUrl]);
  //       });
  //     },
  //     (err) => {
  //       if (err.status === 0) {
  //         this.invalidCredentials = true;
  //         toastr.error("Failed to connect remote server. Please try later.", "Error", {
  //           timeOut: "5000",
  //           positionClass: "toast-top-center",
  //           preventDuplicates: true,
  //           extendedTimeOut: 0,
  //           tapToDismiss: false,
  //         });
  //       } else if (err.status === 403) {
  //         this.invalidCredentials = true;
  //         toastr.error("Invalid login credentials.", "Error", {
  //           timeOut: "4000",
  //           positionClass: "toast-top-center",
  //           preventDuplicates: true,
  //           extendedTimeOut: 0,
  //           tapToDismiss: false,
  //         });
  //       } else if (err.status >= 500) {
  //         toastr.error("Remote server internal error. Please try later.", "Error", {
  //           timeOut: "5000",
  //           positionClass: "toast-top-center",
  //           preventDuplicates: true,
  //           extendedTimeOut: 0,
  //           tapToDismiss: false,
  //         });
  //       } else if (err.status >= 400) {
  //         toastr.error("Login error.", "Error", {
  //           timeOut: "4000",
  //           positionClass: "toast-top-center",
  //           preventDuplicates: true,
  //           extendedTimeOut: 0,
  //           tapToDismiss: false,
  //         });
  //       }
  //       this.isFormBusy = false;
  //     }
  //   );
  // }
}


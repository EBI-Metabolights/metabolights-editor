import { Component, OnInit, inject } from "@angular/core";
import { AuthService } from "./../../../services/metabolights/auth.service";
import { EditorService } from "./../../../services/editor.service";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { MtblsJwtPayload } from "src/app/services/headers";
import jwtDecode  from "jwt-decode";
import * as toastr from "toastr";
import {PlatformLocation} from '@angular/common';
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import Keycloak from "keycloak-js"
import { CookieService } from 'ngx-cookie-service';
@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
    standalone: false
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
    private cookieService: CookieService
    // private configService: ConfigurationService,
    // private platformLocation: PlatformLocation
  ) {
    // this.baseHref = this.configService.baseHref;
    // this.environmentName = this.platformLocation.getBaseHrefFromDOM();
    // this.environmentName = this.environmentName.replace("/metabolights", "");
    // this.environmentName = this.environmentName.replace("/editor", "");
    // this.environmentName = this.environmentName.replace("/", "");
  }

  private readonly keycloak = inject(Keycloak);

  public isLoggedIn = false;
  public userProfile = null;

  public async ngOnInit() {
    this.store.dispatch(new Loading.Disable())

    // this.isLoggedIn = !this.keycloak.loginRequired
    // const token = await this.keycloak.token
    if (this.keycloak.authenticated) {
      // await this.logout()
      await this.login();
    } else {
      this.userProfile = await this.keycloak.loadUserProfile();
      localStorage.setItem("jwt", this.keycloak.token);
      const decoded = jwtDecode<MtblsJwtPayload>(this.keycloak.token);
      const expiration = decoded.exp;
      const user = decoded.sub;
      localStorage.setItem("jwtExpirationTime", expiration.toString());
      this.router.navigate([this.editorService.redirectUrl]);
    }
  }

  public async login() {
      await this.keycloak.login();
      toastr.success(this.userProfile + " logged in successfully.", "Successful login", {
        timeOut: "5000",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });
      this.userProfile = await this.keycloak.loadUserProfile();
      localStorage.setItem("jwt", this.keycloak.token);
      const decoded = jwtDecode<MtblsJwtPayload>(this.keycloak.token);
      const expiration = decoded.exp;
      const user = decoded.sub;
      localStorage.setItem("jwtExpirationTime", expiration.toString());
      if (this.editorService.redirectUrl != "login") {
        this.router.navigate([this.editorService.redirectUrl]);
      }

  }

  public async logout() {
    await this.keycloak.logout();
  }

  // ngOnInit() {
  //   this.store.dispatch(new Loading.Disable())

  //   // this.form = this.fb.group({
  //   //   email: ["", [Validators.required, Validators.email]],
  //   //   secret: ["", Validators.required],
  //   // });
  //   // this.endpoint = this.configService.config.endpoint;
  //   // if (this.endpoint.endsWith("/") === false){
  //   //   this.endpoint = this.endpoint + "/";
  //   // }
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
  //         const jwt = response.headers.get("jwt");
  //         const decoded = jwtDecode<MtblsJwtPayload>(jwt);
  //         const expiration = decoded.exp;
  //         const user = decoded.sub;
  //         localStorage.setItem("jwt", jwt);
  //         localStorage.setItem("jwtExpirationTime", expiration.toString());
  //         this.editorService.initialise(data, true);
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


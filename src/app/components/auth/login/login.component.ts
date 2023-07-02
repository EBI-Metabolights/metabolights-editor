import { IAppState } from "./../../../store";
import { Component, OnInit } from "@angular/core";
import { AuthService } from "./../../../services/metabolights/auth.service";
import { EditorService } from "./../../../services/editor.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgRedux, select } from "@angular-redux/store";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { MtblsJwtPayload } from "src/app/services/headers";
import jwtDecode  from "jwt-decode";
import * as toastr from "toastr";
import { stringify } from "querystring";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isFormBusy = false;
  invalidCredentials = false;
  domain = "";
  endpoint: string;
  baseHref: string;
  environmentName: string;
  constructor(
    private fb: FormBuilder,
    private ngRedux: NgRedux<IAppState>,
    public router: Router,
    private editorService: EditorService,
    private configService: ConfigurationService
  ) {
    this.baseHref = this.configService.baseHref;
    this.environmentName = environment.context;
  }

  ngOnInit() {
    if (!environment.isTesting) {
      this.ngRedux.dispatch({ type: "DISABLE_LOADING" });
    }
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      secret: ["", Validators.required],
    });
    this.domain = this.configService.config.metabolightsWSURL.domain;
    this.endpoint = this.configService.config.endpoint;
    if (this.endpoint.endsWith("/") === false){
      this.endpoint = this.endpoint + "/";
    }
  }

  resetForm() {
    this.form.reset();
    this.invalidCredentials = false;
  }


  login(event) {
    event.preventDefault();
    this.isFormBusy = true;
    this.invalidCredentials = false;

    if (this.form.invalid) {
      if (this.form.get("email").value && this.form.get("email").value !== "") {
        this.form.controls.email.markAsTouched();
      }
      if (
        this.form.get("secret").value &&
        this.form.get("secret").value !== ""
      ) {
        this.form.controls.secret.markAsTouched();
      }
      this.isFormBusy = false;
      return;
    }

    const body = {
      email: this.form.get("email").value,
      secret: this.form.get("secret").value,
    };
    this.editorService.login(body).subscribe(
      (response) => {
        this.editorService.getValidatedJWTUser(response).subscribe((data) => {
          const jwt = response.headers.get("jwt");
          const decoded = jwtDecode<MtblsJwtPayload>(jwt);
          const expiration = decoded.exp;
          const user = decoded.sub;
          localStorage.setItem("jwt", jwt);
          localStorage.setItem("jwtExpirationTime", expiration.toString());
          this.editorService.initialise(data, true);
          toastr.success(user + " successfully logged in.", "Successful login...", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.router.navigate([this.editorService.redirectUrl]);
        });
      },
      (err) => {
        if (err.status === 0) {
          this.invalidCredentials = true;
          toastr.error("Failed to connect remote server. Please try later.", "Error", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        } else if (err.status === 403) {
          this.invalidCredentials = true;
          toastr.error("Invalid username or passoword.", "Error", {
            timeOut: "4000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        } else if (err.status >= 500) {
          toastr.error("Remote server internal error. Please try later.", "Error", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        } else if (err.status >= 400) {
          toastr.error("Login error.", "Error", {
            timeOut: "4000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
        this.isFormBusy = false;
      }
    );
  }
}


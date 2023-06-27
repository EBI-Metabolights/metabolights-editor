import { Component, OnInit, Input } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "./../../../store";
import { Router } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { environment } from "src/environments/environment";
import { VersionInfo } from "src/environment.interface";
import { Observable } from "rxjs";
@Component({
  selector: "nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.css"],
})
export class NavBarComponent implements OnInit {
  @Input("mode") mode: any;
  @select((state) => state.study.identifier) studyIdentifier: any;
  @select((state) => state.status.editorVersion) editorVersionState: Observable<VersionInfo>;

  editorVersion: string;
  baseHref: string;
  endpoint = "";
  environmentName: string;
  studyid: string;
  constructor(
    public router: Router,
    private editorService: EditorService,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();

    this.environmentName = environment.context;
  }

  ngOnInit() {
    this.endpoint = this.configService.config.endpoint;
    this.editorVersionState.subscribe((value) => {
      if (value) {
        this.editorVersion = value.version + "-" +value.releaseName;
        console.log("Version: " + this.editorVersion );
      } else {
        console.log("Version is not defined " );
      }

    });
    this.studyIdentifier.subscribe((value) => {
      this.studyid = value;
    });
  }

  logOut() {
    this.editorService.logout(true);
  }

  backToMetabolights() {
    window.location.href = this.endpoint;
  }

  redirectToConsole() {
    this.router.navigate(["/console"]);
  }
}

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
import { ApiVersionInfo } from "src/app/models/mtbl/mtbls/interfaces/common";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select } from "@ngxs/store";
import { env } from "process";
import { ApplicationState, MtblsBackendVersion, MtblsEditorVersion } from "src/app/ngxs-store/non-study/application/application.state";
@Component({
  selector: "nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.css"],
})
export class NavBarComponent implements OnInit {
  @Input("mode") mode: any;
  @select((state) => state.study.identifier) studyIdentifier: any;
  @select((state) => state.status.editorVersion) editorVersionState: Observable<VersionInfo>;
  @select((state) => state.status.backendVersion) apiVersionState: Observable<ApiVersionInfo>;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(ApplicationState.editorVersion) editorVersion$: Observable<MtblsEditorVersion>;
  @Select(ApplicationState.backendVersion) apiVersion$: Observable<MtblsBackendVersion>;


  editorVersion: string;
  apiVersion: string;
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
    this.baseHref = this.configService.baseHref;
    this.environmentName = this.platformLocation.getBaseHrefFromDOM();
    this.environmentName = this.environmentName.replace("/metabolights", "");
    this.environmentName = this.environmentName.replace("/editor", "");
    this.environmentName = this.environmentName.replace("/", "");
  }

  ngOnInit() {
    this.endpoint = this.configService.config.endpoint;
    if (!environment.useNewState) {
      this.editorVersionState.subscribe((value) => {
        if (value) {
          this.editorVersion = value.version + "-" + value.releaseName;
        } else {
          console.log("Version is not defined " );
        }
      });
      this.apiVersionState.subscribe((value) => {
        if (value) {
          this.apiVersion = value.about.api.version;
        } else {
          console.log("API Version is not defined " );
        }
      });
      this.studyIdentifier.subscribe((value) => {
        this.studyid = value;
      });
    } else {
      this.setUpSubscriptionsNgxs();
    }
    
  }

  setUpSubscriptionsNgxs() {
    this.editorVersion$.subscribe((value) => {
      if (value) {
        this.editorVersion = value.version + "-" + value.releaseName;
      } else {
        console.log("Version is not defined " );
      }
    });
    this.apiVersion$.subscribe((value) => {
      if (value) {
        this.apiVersion = value.about.api.version;
      } else {
        console.log("API Version is not defined " );
      }
    });
    this.studyIdentifier$.subscribe((value) => {
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

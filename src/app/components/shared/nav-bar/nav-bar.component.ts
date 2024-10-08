import { Component, OnInit, Input, inject } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { Router } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ApplicationState, MtblsBackendVersion, MtblsEditorVersion } from "src/app/ngxs-store/non-study/application/application.state";
@Component({
  selector: "nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.css"],
})
export class NavBarComponent implements OnInit {
  @Input("mode") mode: any;

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorVersion$: Observable<MtblsEditorVersion> = inject(Store).select(ApplicationState.editorVersion);
  apiVersion$: Observable<MtblsBackendVersion> = inject(Store).select(ApplicationState.backendVersion);


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
    this.setUpSubscriptionsNgxs();
    
    
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

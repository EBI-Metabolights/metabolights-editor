import { Component, OnInit, Input, inject } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { Router } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ApplicationState, MtblsBackendVersion, MtblsEditorVersion } from "src/app/ngxs-store/non-study/application/application.state";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
@Component({
    selector: "nav-bar",
    templateUrl: "./nav-bar.component.html",
    styleUrls: ["./nav-bar.component.css"],
    standalone: false
})
export class NavBarComponent implements OnInit {
  @Input("mode") mode: any;

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  obfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);

  editorVersion$: Observable<MtblsEditorVersion> = inject(Store).select(ApplicationState.editorVersion);
  apiVersion$: Observable<MtblsBackendVersion> = inject(Store).select(ApplicationState.backendVersion);

  studyStatus: string;
  previewEnabled = false;
  editorVersion: string;
  apiVersion: string;
  baseHref: string;
  endpoint = "";
  environmentName: string;
  studyId: string;
  obfuscationCode: string;
  reviewerLink: string = null;
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
    this.obfuscationCode$.subscribe((value) => {
      if (value !== null ) {
        this.obfuscationCode = value;
        this.updateReviewerLink();
      }
    });
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
      if (value) {
        this.studyId = value;
        this.updateReviewerLink();
      }
    });
    this.studyStatus$.subscribe((value) => {
      if (value) {
        this.studyStatus = value;
        this.updatePreviewEnabled();
        this.updateReviewerLink();
      }
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
  updatePreviewEnabled() {
    this.previewEnabled = this.mode != 'light' && this.studyStatus != 'Provisional';
  }
  updateReviewerLink() {
    if (this.studyStatus && this.studyId ) {
      this.reviewerLink = null;
      if (this.studyStatus == "Private" || this.studyStatus == "In Review") {
        if (this.obfuscationCode) {
          this.reviewerLink = this.baseHref + this.studyId + "?reviewCode=" + this.obfuscationCode;
        }
      } if (this.studyStatus == "Public") {
        this.reviewerLink = this.baseHref + this.studyId;
      } 
    } 

  }
}

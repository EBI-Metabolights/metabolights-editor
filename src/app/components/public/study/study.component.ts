import { Component, inject, OnInit } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { ActivatedRoute } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import {AuthGuard} from '../../../auth-guard.service';
import { StudyPermission } from "src/app/services/headers";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { SetTabIndex } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { Observable } from "rxjs";
import { IStudyDetail } from "src/app/models/mtbl/mtbls/interfaces/study-detail.interface";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ValidationReport } from "src/app/ngxs-store/study/validation/validation.actions";
import { ViolationType } from "../../study/validations-v2/interfaces/validation-report.types";
import { RevisionStatusTransformPipe } from "../../shared/pipes/revision-status-transform.pipe";

@Component({
  selector: "study",
  templateUrl: "./study.component.html",
  styleUrls: ["./study.component.css"],
})
export class PublicStudyComponent implements OnInit {

  currentTabIndex$: Observable<string> = inject(Store).select(TransitionsState.currentTabIndex);
  user$: Observable<Owner> = inject(Store).select(UserState.user); // potentially unused
  userStudies$: Observable<IStudyDetail[]> = inject(Store).select(UserState.userStudies); // Potentially unused
  studyIdentifier$: Observable<string> = this.store.select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  curationRequest$: Observable<string> = inject(Store).select(GeneralMetadataState.curationRequest);
  revisionNumber$: Observable<number> = inject(Store).select(GeneralMetadataState.revisionNumber);
  revisionDatetime$: Observable<string> = inject(Store).select(GeneralMetadataState.revisionDatetime);
  revisionStatus$: Observable<number> = inject(Store).select(GeneralMetadataState.revisionStatus);
  studyReviewerLink$: Observable<string> = inject(Store).select(GeneralMetadataState.reviewerLink);
  investigationFailed$: Observable<boolean> = inject(Store).select(ApplicationState.investigationFailed);
  studyPermission$: Observable<StudyPermission> = inject(Store).select(GeneralMetadataState.studyPermission);

  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);
  studyValidation$: Observable<any> = inject(Store).select(ValidationState.reportV2);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);
  mhdAccession$: Observable<string> = inject(Store).select(GeneralMetadataState.mhdAccession);

  revisionNumber = null;
  revisionDatetime = null;
  revisionStatus = null;
  loading: any = true;
  requestedTab = 0;
  status = "";
  curationRequest = ""
  curationStatus = "";
  tab = "descriptors";
  requestedStudy: string = null;
  studyError = false;
  validation: any = {};
  files: any = null;
  currentUser: any = null;
  isOwner: any = false;
  isCurator: any = false;
  endpoint = "";
  baseHref: any = "";
  reviewerLink: string = null;
  studyPermission: StudyPermission = null;
  notReadyValidationMessage: string = null;
  validationStatus: ViolationType = null;
  obfuscationCode: string = null;
  revisionStatusTransform = new RevisionStatusTransformPipe()
  mhdAccession: string = null;
  private loadMode: "public" | "review" = "public";
  private subscriptionsInitialized = false;
  constructor(
    private store: Store,
    private editorService: EditorService,
    private authGuardService: AuthGuard,
    private route: ActivatedRoute,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {

    this.baseHref = this.platformLocation.getBaseHrefFromDOM();

  }

  studyPermissionUpdated() {
      if (!this.studyPermission) {
        this.isOwner = false;
        this.isCurator = false;
        return;
      }

      let reviewMode = false
      
      if (this.studyPermission.studyId && this.studyPermission.studyId.length > 0 && this.studyPermission.studyId === this.requestedStudy){
        if (this.obfuscationCode === this.studyPermission.obfuscationCode 
          && ["INREVIEW", "INCURATION"].includes(this.studyPermission.studyStatus.toUpperCase())){
          reviewMode = true;
        }
      }
      if (this.studyPermission.submitterOfStudy){
        this.isOwner = true;
      } else {
        this.isOwner = false;
      }
      if (this.studyPermission.userRole 
        && ["ROLE_SUPER_USER", "SYSTEM_ADMIN", "CURATOR"].includes(this.studyPermission.userRole.toUpperCase())){
          this.isCurator = true;
      } else {
        this.isCurator = false;
      }

    if (reviewMode && this.loadMode !== "review") {
      this.loadStudyNgxs(this.studyPermission.studyId);
    }
    this.calculateNotReadyValidationMessage();

  }
  ngOnInit() {
    if (this.configService.config.endpoint.endsWith("/")){
      this.endpoint = this.configService.config.endpoint;
    } else {
      this.endpoint = this.configService.config.endpoint + "/";
    }
    this.obfuscationCode = this.route.snapshot.queryParamMap.get("reviewCode");
    this.loadStudyNgxs(null);

  }

  loadStudyNgxs(studyId) {
    this.loadMode = studyId ? "review" : "public";
    this.loading = true;
    this.editorService.toggleLoading(false);
    if (studyId) {
      this.editorService.loadStudyInReview(studyId);
    } else {
      this.editorService.loadPublicStudy({
        id: this.route.snapshot.paramMap.get("study"),
      });
    }
    if (this.subscriptionsInitialized) {
      return;
    }
    this.subscriptionsInitialized = true;

    this.studyIdentifier$.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });

    this.mhdAccession$.subscribe((value) => {
      this.mhdAccession = value;
    });

    this.studyValidation$.subscribe((value) => {
      this.validation = value;
      this.calculateNotReadyValidationMessage();
    });
    this.studyPermission$.subscribe((value) => {
      this.studyPermission = value;
      this.studyPermissionUpdated()
    });
    this.revisionNumber$.subscribe((value) => {
      if (value) {
        this.revisionNumber = value;
      }
    });

    this.revisionDatetime$.subscribe((value) => {
      if (value) {
        this.revisionDatetime = value;
      }
    });

    this.studyFiles$.subscribe((value) => {
      this.files = value;
      this.loading = false;
        if(this.status === undefined || this.status === null || this.status === "Public"){
          return;
        }

        if (this.isCurator || this.isOwner) {
          this.store.dispatch(new ValidationReport.Get(this.requestedStudy))
        }
    });

    this.investigationFailed$.subscribe((value) => {
      this.studyError = value;
    });

    this.studyStatus$.subscribe((value) => {
      if(value){
        this.status = value;
        this.calculateNotReadyValidationMessage();
      }
    });


    this.validationStatus$.subscribe((value) => {
      this.validationStatus = value;
    })


    this.curationRequest$.subscribe((value) => {
      if(value){
        this.curationRequest = value;
        this.updateCurationStatus();
      }
    });

    this.studyReviewerLink$.subscribe((value) => {
      this.reviewerLink = value;
    });

    this.revisionStatus$.subscribe((value) => {
      if (value !== null) {
        this.revisionStatus = this.revisionStatusTransform.transform(value)
      } else {
        this.revisionStatus = null;
      }
    });

    this.route.params.subscribe((params) => {
      if (params.tab === "files") {
        this.requestedTab = 5;
        this.tab = "files";
      } else if (params.tab === "metabolites") {
        this.requestedTab = 4;
        this.tab = "metabolites";
      } else if (params.tab === "assays") {
        this.requestedTab = 2;
        this.tab = "assays";
      } else if (params.tab === "samples") {
        this.requestedTab = 1;
        this.tab = "samples";
      } else if (params.tab === "protocols") {
        this.requestedTab = 3;
        this.tab = "protocols";
      } else if (params.tab === "validations") {
        this.requestedTab = 6;
        this.tab = "validations";
      } else {
        this.requestedTab = 0;
        this.tab = "overview";
      }
      this.selectCurrentTab(this.requestedTab, this.tab);
    });
  }

  selectCurrentTab(index, tab) {
    this.store.dispatch(new SetTabIndex(index))


    const queryParams = this.route.snapshot.queryParamMap;


    const urlSplit = window.location.pathname
      .replace(/\/$/, "")
      .split("/")
      .filter((n) => n);
    if (urlSplit.length >= 2) {
      if (urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0 && urlSplit[urlSplit.length - 1].indexOf("REQ") < 0) {
        urlSplit.pop();
      }
    }
    let location = window.location.origin + "/" + urlSplit.join("/") + "/" + tab;
    if (queryParams.keys.length > 0) {
      const params = Array(0);
      for(const i of queryParams.keys){
        if (i !== "loginOneTimeToken"){
          params.push(i+"="+queryParams.get(i));
        }
      }
      if (params.length > 0){
        location = window.location.origin + "/" + urlSplit.join("/") + "/" + tab + "?" + params.join("&");
      }

    }
    window.history.pushState(
      "",
      "",
      location
    );
    if (index === 6) {
      if ((this.isCurator || this.isOwner) && (this.status && this.status.toLowerCase() !== 'public' )) {
        this.store.dispatch(new ValidationReport.Get(this.requestedStudy))
      }
      document.getElementById("tab-content-wrapper").scrollIntoView();
    }
  }

  isJSON(data) {
    let ret = true;
    try {
      JSON.parse(data);
    } catch (e) {
      ret = false;
    }
    return ret;
  }

  calculateNotReadyValidationMessage(){
    if (this.validation != null && this.validation.status != null &&
      this.validation.status.toLowerCase() === 'not ready' && this.status !== null) {
      if (this.status.toLowerCase() === 'public') {
        this.notReadyValidationMessage = null;
      } else {
        this.notReadyValidationMessage = 'Required';
      }
    } else {
      this.notReadyValidationMessage = "Required";
    }

  }

  // this.studyValidation ? this.validationMessageTransform.transform(this.studyValidation.status) : "";

  updateCurationStatus() {
    if (this.curationRequest === "NO_CURATION") {
      this.curationStatus = "Minimum";
    } else if (this.curationRequest === "MANUAL_CURATION") {
      this.curationStatus = "MetaboLights";
    } else {
      return "Minimum";
    }
  }
}

import { Component, inject, OnInit } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { LabsWorkspaceService } from "src/app/services/labs-workspace.service";
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
  studyReviewerLink$: Observable<string> = inject(Store).select(GeneralMetadataState.reviewerLink);
  investigationFailed$: Observable<boolean> = inject(Store).select(ApplicationState.investigationFailed);
  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);
  studyValidation$: Observable<any> = inject(Store).select(ValidationState.report);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);


  loading: any = true;
  requestedTab = 0;
  status = "";
  curationRequest = ""
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
  permissions: StudyPermission = null;
  notReadyValidationMessage: string = null;
  validationStatus: ViolationType = null;
  obfuscationCode: string = null;
  constructor(
    private store: Store,
    private editorService: EditorService,
    private authGuardService: AuthGuard,
    private route: ActivatedRoute,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {

    this.baseHref = this.platformLocation.getBaseHrefFromDOM();

    this.permissions = this.store.snapshot().application.studyPermission

    const curatorStatus = localStorage.getItem("isCurator");
    const userName = localStorage.getItem("username");
    if (curatorStatus !== null && curatorStatus.toLowerCase() === "true"){
      this.isCurator = true;
    }
    let reviewMode = false;
    const studyId = this.route.snapshot.paramMap.get("study");
    this.obfuscationCode = this.route.snapshot.queryParamMap.get("reviewCode");

    if (this.permissions && this.permissions.studyId.length > 0 && this.permissions.studyId === studyId){
      if (this.obfuscationCode === this.permissions.obfuscationCode && ["INREVIEW", "INCURATION"].includes(this.permissions.studyStatus.toUpperCase())){
        reviewMode = true;
      }
      if (userName !== null && this.permissions.userName === userName && this.permissions.submitterOfStudy){
        this.isOwner = true;
      }
    }

    if (reviewMode === true) {
      this.loadStudyNgxs(studyId);
    } else {
      this.loadStudyNgxs(null);
    }
    this.calculateNotReadyValidationMessage();
  }

  ngOnInit() {
    if (this.configService.config.endpoint.endsWith("/")){
      this.endpoint = this.configService.config.endpoint;
    } else {
      this.endpoint = this.configService.config.endpoint + "/";
    }

  }

  loadStudyNgxs(studyId) {
    this.editorService.toggleLoading(false);
    if (studyId) {
      this.editorService.loadStudyInReview(studyId);
    } else {
      this.editorService.loadPublicStudy({
        id: this.route.snapshot.paramMap.get("study"),
      });
    }
    this.studyIdentifier$.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });

    this.studyValidation$.subscribe((value) => {
      this.validation = value;
      this.calculateNotReadyValidationMessage();
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
      }
    });

    this.studyReviewerLink$.subscribe((value) => {
      this.reviewerLink = value;
    });

    this.route.params.subscribe((params) => {
      if (params.tab === "files") {
        this.requestedTab = 5;
        this.tab = "files";
      } else if (params.tab === "metabolites") {
        this.requestedTab = 4;
        this.tab = "metabolites";
      } else if (params.tab === "assays") {
        this.requestedTab = 3;
        this.tab = "assays";
      } else if (params.tab === "samples") {
        this.requestedTab = 2;
        this.tab = "samples";
      } else if (params.tab === "protocols") {
        this.requestedTab = 1;
        this.tab = "protocols";
      } else if (params.tab === "validations") {
        this.requestedTab = 6;
        this.tab = "validations";
      } else {
        this.requestedTab = 0;
        this.tab = "descriptors";
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
}

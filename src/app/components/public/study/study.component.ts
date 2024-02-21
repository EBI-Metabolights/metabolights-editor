import { Component, OnInit } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { Router } from "@angular/router";
import { IAppState } from "../../../store";
import { NgRedux, select } from "@angular-redux/store";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { LabsWorkspaceService } from "src/app/services/labs-workspace.service";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import {SessionStatus} from '../../../models/mtbl/mtbls/enums/session-status.enum';
import {AuthGuard} from '../../../auth-guard.service';
import {browserRefresh} from '../../../app.component';
import { StudyPermisssion } from "src/app/services/headers";
import { PlatformLocation } from "@angular/common";

@Component({
  selector: "study",
  templateUrl: "./study.component.html",
  styleUrls: ["./study.component.css"],
})
export class PublicStudyComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.status.user) user;
  @select((state) => state.study.status) studyStatus;
  @select((state) => state.study.validation) studyValidation;
  @select((state) => state.status.currentTabIndex) currentIndex: number;
  @select((state) => state.study.investigationFailed) investigationFailed;
  @select((state) => state.study.files) studyFiles;
  @select((state) => state.status.userStudies) userStudies;
  @select((state) => state.study.reviewerLink) studyReviewerLink;

  loading: any = true;
  requestedTab = 0;
  status = "submitted";
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
  permissions: StudyPermisssion = null;
  notReadyValidationMessage: string = null;

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private editorService: EditorService,
    private authGuardService: AuthGuard,
    private router: Router,
    private route: ActivatedRoute,
    private labsWorkspaceService: LabsWorkspaceService,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {

    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
    this.permissions = this.ngRedux.getState().status.studyPermission;

    const curatorStatus = localStorage.getItem("isCurator");
    const userName = localStorage.getItem("username");
    if (curatorStatus !== null && curatorStatus.toLowerCase() === "true"){
      this.isCurator = true;
    }
    let reviewMode = false;
    const studyId = this.route.snapshot.paramMap.get("study");
    const obfuscationCode = this.route.snapshot.queryParamMap.get("reviewCode");

    if (this.permissions && this.permissions.studyId.length > 0 && this.permissions.studyId === studyId){
      if (obfuscationCode === this.permissions.obfuscationCode && this.permissions.studyStatus.toUpperCase() === "INREVIEW"){
        reviewMode = true;
      }
      if (userName !== null && this.permissions.userName === userName && this.permissions.submitterOfStudy){
        this.isOwner = true;
      }
    }

    if (reviewMode === true) {
      this.loadStudy(studyId);
    } else {
      this.loadStudy(null);
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

  loadStudy(studyId) {
    this.editorService.toggleLoading(false);
    if (studyId) {
      this.editorService.loadStudyInReview(studyId);
    } else {
      this.editorService.loadPublicStudy({
        id: this.route.snapshot.paramMap.get("study"),
      });
    }
    this.studyIdentifier.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });

    this.studyValidation.subscribe((value) => {
      this.validation = value;
      this.calculateNotReadyValidationMessage();
    });

    this.studyFiles.subscribe((value) => {
      this.files = value;
      this.loading = false;
        if(this.status === undefined || this.status === null || this.status === "Public"){
          return;
        }

        if (this.isCurator || this.isOwner) {
          this.editorService.getValidationReport();
        }
    });

    this.investigationFailed.subscribe((value) => {
      this.studyError = value;
    });

    this.studyStatus.subscribe((value) => {
      if(value){
        this.status = value;
        this.calculateNotReadyValidationMessage();
      }
    });

    this.studyReviewerLink.subscribe((value) => {
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
    this.ngRedux.dispatch({
      type: "SET_TAB_INDEX",
      body: {
        currentTabIndex: index,
      },
    });


    const queryParams = this.route.snapshot.queryParamMap;


    const urlSplit = window.location.pathname
      .replace(/\/$/, "")
      .split("/")
      .filter((n) => n);
    if (urlSplit.length >= 2) {
      if (urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0) {
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
        this.editorService.getValidationReport();
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

import { Component, OnDestroy, OnInit } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { Router } from "@angular/router";
import { IAppState } from "../../../store";
import { NgRedux, select } from "@angular-redux/store";
import { ActivatedRoute } from "@angular/router";
import { MetaboLightsWSURL } from "./../../../services/globals";
import { HttpClient } from "@angular/common/http";
import { LabsWorkspaceService } from "src/app/services/labs-workspace.service";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
// doing this as having both select functions from the state libraries causes an error.
import * as NGRX from "@ngrx/store"
import { selectUser } from "src/app/state/user.selectors";
import { takeUntil } from "rxjs/operators";
import { of } from "rxjs";
import { selectIsInitialised } from "src/app/state/meta-settings.selector";
import { IsInitService } from "src/app/is-init.service";
import { selectTabIndex } from "src/app/state/ancillary.selector";
import * as AncillaryActions from "src/app/state/ancillary.actions"
import {SessionStatus} from '../../../models/mtbl/mtbls/enums/session-status.enum';
import {AuthGuard} from '../../../auth-guard.service';
import {browserRefresh} from '../../../app.component';

@Component({
  selector: "study",
  templateUrl: "./study.component.html",
  styleUrls: ["./study.component.css"],
})
export class PublicStudyComponent implements OnInit, OnDestroy {
  //old state
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.status) studyStatus;
  @select((state) => state.study.validation) studyValidation;
  @select((state) => state.study.investigationFailed) investigationFailed;
  @select((state) => state.study.files) studyFiles;
  @select((state) => state.study.reviewerLink) studyReviewerLink;

  //new state
  user$ = this.store.select(selectUser) // seemingly not used above
  userStudies$ = this.store.select(selectUser) // seemingly not used above 
  currentIndex$ = this.store.select(selectTabIndex)

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
  domain = "";
  reviewerLink: string = null;

  destroy$ = of(null)

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private editorService: EditorService,
    private authGuardService: AuthGuard,
    private router: Router,
    private route: ActivatedRoute,
    private labsWorkspaceService: LabsWorkspaceService,
    private configService: ConfigurationService,
    private store: NGRX.Store,
    private isInitService: IsInitService
  ) {
    let isInitialised;
    if (!environment.isTesting) {
      //sInitialised = this.ngRedux.getState().status["isInitialised"]; // eslint-disable-line @typescript-eslint/dot-notation
      
    }
    isInitialised = this.isInitService.getIsInit();
    let obfuscationCode = localStorage.getItem("obfuscationCode");
    const owner = localStorage.getItem("isOwner");
    if (owner && owner !== null && owner !== "") {
      this.isOwner = JSON.parse(owner.toLowerCase());
    }

    const curator = localStorage.getItem("isCurator");
    if (curator && curator !== null && curator !== "") {
      this.isCurator = JSON.parse(curator.toLowerCase());
    }

    if (obfuscationCode) {
      obfuscationCode = obfuscationCode.replace("reviewer", "");
      const studyID = localStorage.getItem("mtblsid");
      if (!isInitialised.ready) {
        this.editorService.initialise(
          '{"apiToken":"ocode:' + obfuscationCode + '"}',
          false
        );
        if (!environment.isTesting) {
          this.loadStudy(studyID);
        }
      }
    } else {
      switch (this.authGuardService.evaluateSession(isInitialised)) {
        case SessionStatus.Active:
          if (browserRefresh) {
            this.editorService.initialise(localStorage.getItem('user'), false);
          }
          if (!environment.isTesting) {
            this.loadStudy(null);
          }
          break;
        default:
          if (!environment.isTesting) {
            this.loadStudy(null);
          }
          break;

      }
    }
  }

  ngOnInit() {
    this.domain = this.configService.config.metabolightsWSURL.domain;
  }

  ngOnDestroy(): void {
      this.destroy$.subscribe(res => {

      })
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
    });

    this.studyFiles.subscribe((value) => {
      this.files = value;
      this.loading = false;
      if (this.isCurator || this.isOwner) {
        this.editorService.validateStudy();
      }
    });

    this.investigationFailed.subscribe((value) => {
      this.studyError = value;
    });

    this.studyStatus.subscribe((value) => {
      this.status = value;
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
    });
    this.selectCurrentTab(this.requestedTab, this.tab);
  }

  selectCurrentTab(index, tab) {
    this.store.dispatch(AncillaryActions.setTabIndex({newIndex: index}));
    
    const urlSplit = window.location.pathname
      .replace(/\/$/, "")
      .split("/")
      .filter((n) => n);
    if (urlSplit.length >= 2) {
      if (urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0) {
        urlSplit.pop();
      }
    }
    window.history.pushState(
      "",
      "",
      window.location.origin + "/" + urlSplit.join("/") + "/" + tab
    );
    if (index === 6) {
      this.editorService.validateStudy();
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
}

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EditorService } from "./../../services/editor.service";
import { Router } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { SetTabIndex } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { Select, Store } from "@ngxs/store";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { ValidationReport } from "src/app/ngxs-store/study/validation/validation.actions";
import { UserService } from "src/app/services/decomposed/user.service";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { ViolationType } from "./validations-v2/interfaces/validation-report.types";

@Component({
  selector: "mtbls-study",
  templateUrl: "./study.component.html",
  styleUrls: ["./study.component.css"],
})
export class StudyComponent implements OnInit, OnDestroy {

  currentTabIndex$: Observable<string> = inject(Store).select(TransitionsState.currentTabIndex);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  curationRequest$: Observable<string> = inject(Store).select(GeneralMetadataState.curationRequest);
  investigationFailed$: Observable<boolean> = inject(Store).select(ApplicationState.investigationFailed);
  bannerMessage$: Observable<string> = inject(Store).select(ApplicationState.bannerMessage);
  maintenanceMode$: Observable<boolean> = inject(Store).select(ApplicationState.maintenanceMode);
  studyObfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);
  studyValidation$: Observable<any> = inject(Store).select(ValidationState.report);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);
  validationRunTime$: Observable<string> = inject(Store).select(ValidationState.lastValidationRunTime);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);


  studyError = false;
  requestedTab = 0;
  tab = "descriptors";
  requestedStudy: string = null;
  status = "";
  curationRequest = "";
  validation: any = {};
  obfuscationCode: string = null;
  endpoint: string = null;
  messageExpanded = false;
  baseHref: string;
  banner: string = null;
  underMaintenance = false;
  isCurator = false;
  validationStatus: ViolationType = null;
  validationRunTime: string =  null;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private editorService: EditorService,
    private configService: ConfigurationService
  ) {
     this.setUpSubscriptionsNgxs()
  }


  setUpSubscriptionsNgxs() {
    this.baseHref = this.configService.baseHref;
    this.editorService.initialiseStudy(this.route);
    this.isCurator$.subscribe((value) => {
      this.isCurator = value;
    });
    this.studyObfuscationCode$.subscribe((value) => {
      this.obfuscationCode = value;
    });
    this.bannerMessage$.subscribe((value) => {
      this.banner = value;
    });
    this.maintenanceMode$.subscribe((value) => {
      this.underMaintenance = value;
    });
    this.studyIdentifier$.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });
    this.endpoint = this.configService.config.endpoint;
    if (this.configService.config.endpoint.endsWith("/") === false){
      this.endpoint = this.endpoint + "/";
    }
    this.investigationFailed$.subscribe((value) => {
      this.studyError = value;
      if (this.studyError) this.selectCurrentTab(5, "files");
    });

    this.studyStatus$.subscribe((value) => {
      if (value) {
        this.status = value;
      }
    });

    this.curationRequest$.subscribe((value) => {
      if (value) {
        this.curationRequest = value;
      }
    });

    this.studyValidation$.subscribe((value) => {
      this.validation = value;
    });

    this.validationStatus$.subscribe((value) => {
      this.validationStatus = value;
    });

    this.validationRunTime$.subscribe((value) => {
      this.validationRunTime = value;
    })

    this.route.params.subscribe((params) => {
      this.requestedStudy = params.id;
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
      } else if (params.tab === "validationsv2") {
        this.requestedTab = 7;
        this.tab = "validationsv2"
      }
      else {
        this.requestedTab = 0;
        this.tab = "descriptors";
      }
      this.selectCurrentTab(this.requestedTab, this.tab);
    });

  }

  ngOnDestroy() {
    window.removeEventListener("scroll", this.scrollFunction, true);
  }

  ngOnInit() {
    window.addEventListener("scroll", this.scrollFunction, true);
  }

  toggleMessage() {
    this.messageExpanded = !this.messageExpanded;
  }

  selectCurrentTab(index, tab) {
    this.store.dispatch(new SetTabIndex(index))
    const urlSplit = window.location.pathname
      .replace(/\/$/, "")
      .split("/")
      .filter((n) => n);
    if (urlSplit.length >= 3) {
      if (urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0 && urlSplit[urlSplit.length - 1].indexOf("REQ") < 0) {
        urlSplit.pop();
      }
    }
    window.history.pushState(
      "",
      "",
      window.location.origin + "/" + urlSplit.join("/") + "/" + tab
    );
    if (index === 6) {
      this.store.dispatch(new ValidationReport.Get(this.requestedStudy))
      if (document.getElementById("tab-content-wrapper")) {
        document.getElementById("tab-content-wrapper").scrollIntoView();
      }
    }
  }

  scrollFunction() {
    if (
      document.body.scrollTop > document.documentElement.clientHeight ||
      document.documentElement.scrollTop > document.documentElement.clientHeight
    ) {
      document.getElementById("scrollToTop").style.display = "block";
    } else {
      document.getElementById("scrollToTop").style.display = "none";
    }
  }

  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}

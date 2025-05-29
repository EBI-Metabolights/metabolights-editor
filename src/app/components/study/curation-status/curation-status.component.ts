import {
  Component,
  inject,
  OnInit
} from "@angular/core";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { filter, Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { RevisionNumber, StudyStatus } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { Loading, SetLoadingInfo } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { ViolationType } from "../validations-v2/interfaces/validation-report.types";
import { RevisionStatusTransformPipe } from "../../shared/pipes/revision-status-transform.pipe";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ConfigurationService } from "src/app/configuration.service";

@Component({
  selector: "curation-status",
  templateUrl: "./curation-status.component.html",
  styleUrls: ["./curation-status.component.css"],
})
export class CurationStatusComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  curationRequest$: Observable<string> = inject(Store).select(GeneralMetadataState.curationRequest);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  revisionNumber = null;
  revisionDatetime = null;
  revisionStatus = null;

  revisionStatusTransform = new RevisionStatusTransformPipe()

  isReadOnly = false;
  isRevisionStatusModalOpen = false;
  isCurationStatusModalOpen = false;
  isModalOpen = false;
  isFormBusy = false;
  status: string = null;
  curator = false;
  toStatus = "Provisional";
  curationRequest = "";
  curationStatus = "";
  revisionComment  = ""
  requestedStudy: string = null;
  baseHref: string;
  validationStatus: ViolationType = null;

  private toastrSettings: Record<string, any> = {}
  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private configService: ConfigurationService,
  ) {
    this.baseHref = this.configService.baseHref;
      this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings = value;
    })


    this.studyStatus$.pipe(filter(val => val !== null)).subscribe((value) => {
      this.store.dispatch(new Loading.Disable())
      if (value !== null) {
        this.status = value;
      }
      this.updateCurationStatus()
    });
    this.isCurator$.subscribe((value) => {
      if (value != null) {
        this.curator = value;
      }
    });
    this.curationRequest$.subscribe((value) => {
      if (value != null) {
        this.curationRequest = value;
      }
      this.updateCurationStatus()
    });
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  ngOnInit() {}

  openCurationStatusModalOpen() {
    this.isCurationStatusModalOpen = true
  }

    closeCurationStatusModel() {

    this.isCurationStatusModalOpen = false
  }
  updateCurationStatus() {
    // if (this.curationRequest === "NO_CURATION") {
    //   this.curationStatus = "Minimum";
    // } else if (this.curationRequest === "MANUAL_CURATION") {
    //   this.curationStatus = "MetaboLights";
    // } else {
    //   return "Minimum";
    // }
    if(this.status === undefined || this.status === null || this.status === "Provisional"){
      return "★";
    }
    if (this.curationRequest === "NO_CURATION") {
      this.curationStatus = "★★★";
    } else if (this.curationRequest === "MANUAL_CURATION") {
      this.curationStatus = "★★";
    } else {
      return "★★";
    }

  }

}

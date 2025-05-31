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
  selector: "mtbls-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.css"],
})
export class StatusComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  curationRequest$: Observable<string> = inject(Store).select(GeneralMetadataState.curationRequest);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);
  revisionNumber$: Observable<number> = inject(Store).select(GeneralMetadataState.revisionNumber);
  revisionDatetime$: Observable<string> = inject(Store).select(GeneralMetadataState.revisionDatetime);
  revisionStatus$: Observable<number> = inject(Store).select(GeneralMetadataState.revisionStatus);
  revisionComment$: Observable<string> = inject(Store).select(GeneralMetadataState.revisionComment);
  revisionTaskMessage$: Observable<string> = inject(Store).select(GeneralMetadataState.revisionTaskMessage);

  revisionNumber = null;
  revisionDatetime = null;
  revisionNumberrevisionStatus = null;
  revisionTaskMessage = ""
  revisionComment = ""
  revisionStatusTransform = new RevisionStatusTransformPipe()

  isReadOnly = false;
  isRevisionStatusModalOpen = false;
  isModalOpen = false;
  isFormBusy = false;
  status: string = null;
  curator = false;
  toStatus = "Provisional";
  curationRequest = "";
  curationStatus = "";
  newRevisionComment  = ""
  requestedStudy: string = null;
  baseHref: string;
  validationStatus: ViolationType = null;
  revisionStatus = ""
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
    this.revisionNumber$.subscribe((value) => {
      if (value !== null) {
        this.revisionNumber = value;
      } else {
        this.revisionNumber = null;
      }
    });

    this.revisionDatetime$.subscribe((value) => {
      if (value) {
        this.revisionDatetime = value;
      }
    });
    this.revisionComment$.subscribe((value) => {
      if (value) {
        this.revisionComment = value;
      } else {
        this.revisionComment = "";
      }
    });
    this.revisionTaskMessage$.subscribe((value) => {
      if (value) {
        this.revisionTaskMessage = value;
      } else {
        this.revisionTaskMessage = "";
      }
    });
    this.revisionStatus$.subscribe((value) => {
      if (value !== null) {
        this.revisionStatus = this.revisionStatusTransform.transform(value);
      } else {
        this.revisionStatus = "";
      }
      if (!this.isReadOnly && this.revisionNumber > 0) {
        let revisionStatusMessage = "A public FTP synchronization task is currently in progress to make the study publicly available." + " Status: " + this.revisionStatus

        if (this.revisionNumber > 1) {
          revisionStatusMessage = revisionStatusMessage + " Revision: " + this.revisionNumber  +"."
        }

        if (["initiated", "in progress"].includes(this.revisionStatus.toLowerCase())) {
          toastr.info(revisionStatusMessage, "Information", {
            timeOut: "10000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
        else if (["failed"].includes(this.revisionStatus.toLowerCase())) {
          toastr.error(revisionStatusMessage, "Error", {
            timeOut: "10000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
      }

      });

    this.studyStatus$.pipe(filter(val => val !== null)).subscribe((value) => {
      this.closeModal();
      this.store.dispatch(new Loading.Disable())
      if (value !== null) {
        const prevStatus = this.status
        this.status = value;
        this.toStatus = value;
        if (prevStatus !== null && this.requestedStudy && this.status !== prevStatus) {
          // TODO: work out why we are unexpectedly seeing this.
          toastr.success("Study status updated.", "Success", this.toastrSettings);
          this.router.navigate(["/study", this.requestedStudy]);
        }
      }
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
    this.validationStatus$.pipe(filter(val => val !== null)).subscribe((val) => {
      this.validationStatus = val;
    });
  }
  changeStatusNgxs(toStatus) {
    this.toStatus = toStatus
  }
  applyChanges() {
    let newRevisionComment = ""
    if (this.revisionNumber == 0) {
      newRevisionComment = 'Initial revision'
    } else {
      newRevisionComment = this.revisionComment
    }
    if (!this.isReadOnly) {
      if (this.toStatus == "New Revision") {
        Swal.fire({
          title: "Are you sure?",
          text: "Dataset will be copied onto public storage. After this task has completed, the dataset will be public automatically.",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Confirm",
          cancelButtonText: "Back",
        }).then((willChange) => {
          if (willChange.value) {

            this.store.dispatch(new Loading.Enable())
            this.store.dispatch(new SetLoadingInfo("Updating study status ..."))
            this.closeModal();
            this.store.dispatch(new RevisionNumber.New(newRevisionComment)).subscribe(
              (completed) => {
                this.closeModal();
                this.store.dispatch(new Loading.Disable())
                this.toStatus = this.status;
              },
              (error) => {
                this.closeModal();
                this.store.dispatch(new Loading.Disable())
                this.toStatus = this.status;
                let message = null;
                typeof error.json === 'function' ? message = error.json().message : "Could not update study status."
                // Swal.fire({
                //   title: message
                // })
                toastr.error(message, "Error", {
                  timeOut: "10000",
                  positionClass: "toast-top-center",
                  preventDuplicates: true,
                  extendedTimeOut: 0,
                  tapToDismiss: false,
                });

              }
            )
          } else {
            this.toStatus = this.status
          }
        }
      )
      }
      else {
        Swal.fire({
          title: "Are you sure?",
          text: "Study status will be updated to " + this.toStatus,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Confirm",
          cancelButtonText: "Back",
        }).then((willChange) => {
          if (willChange.value) {

            this.store.dispatch(new Loading.Enable())
            this.store.dispatch(new SetLoadingInfo("Updating study status ..."))
            this.closeModal();
            this.store.dispatch(new StudyStatus.Update(this.toStatus)).subscribe(
              (completed) => {
                this.closeModal();
                this.store.dispatch(new Loading.Disable())
                this.toStatus = this.status;
              }, (error) => {
                this.closeModal();
                this.store.dispatch(new Loading.Disable())
                this.toStatus = this.status;
                let message = null;
                typeof error.json === 'function' ? message = error.json().message : "Could not update study status."
                // Swal.fire({
                //   title: message
                // })
                toastr.error(message, "Error", {
                  timeOut: "10000",
                  positionClass: "toast-top-center",
                  preventDuplicates: true,
                  extendedTimeOut: 0,
                  tapToDismiss: false,
                });

              }
            )
          } else {
            this.toStatus = this.status
          }
        }
      )
    }
    }
  }

  ngOnInit() {}

  openRevisionStatusModel() {

    this.isRevisionStatusModalOpen = true
  }

  closeRevisionStatusModel() {

    this.isRevisionStatusModalOpen = false
  }
  openModal() {

    if (["Initiated", "In Progress"].includes(this.revisionStatus.toLowerCase()) && (this.revisionNumber > 0)) {
      toastr.error("Please wait Public FTP synchronization task. You may refresh your study page to view the latest status of the study. ", "Error", {
        timeOut: "5000",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });
    }

    this.toStatus = this.status;

    if  (this.curator){
      this.isModalOpen = true;
    } else {
      if (this.status != null &&  ["private", "provisional", "in review"].includes(this.status.toLowerCase())) {
        if (["private", "in review"].includes(this.status.toLowerCase()) && (this.revisionNumber > 0)) {
          toastr.error("Your dataset will be public. It is not allowed to change current status.", "Error", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
        else if (this.status.toLowerCase() == 'provisional' && (this.validationStatus === 'ERROR' || this.validationStatus === null)) {
          toastr.error("Please validate your study and fix all errors before changing status.", "Error", {
            timeOut: "5000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        } else {
          this.isModalOpen = true;
        }
    } else {
      toastr.error("You can not update your study status.", "Error", {
        timeOut: "5000",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });
    }
  }
}
  onCommentChange(event: any) {
    this.revisionComment = event.target.value;
  };

  closeModal() {
    this.isModalOpen = false;
  }
}

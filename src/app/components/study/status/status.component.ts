import {
  Component,
  inject,
  OnInit
} from "@angular/core";
import Swal from "sweetalert2";
import { ActivatedRoute } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { StudyStatus } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.css"],
})
export class StatusComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  curationRequest$: Observable<string> = inject(Store).select(GeneralMetadataState.curationRequest);
  studyValidation$: Observable<any> = inject(Store).select(ValidationState.report);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);


  isReadOnly = false;

  isModalOpen = false;
  isFormBusy = false;
  status: string = null;
  curator = false;
  toStatus = "Submitted";
  curationRequest: string = null;
  requestedStudy: string = null;
  validation: IValidationSummary;

  private toastrSettings: Record<string, any> = {}
  constructor(
    private editorService: EditorService,
    private route: ActivatedRoute,
    private store: Store
  ) {
      this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings = value;
    })
    this.studyValidation$.subscribe((value) => {
      this.validation = value;
    });
    this.studyStatus$.subscribe((value) => {
      if (value !== null) {
        this.status = value;
        this.toStatus = value;
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
  }

  changeStatusNgxs(toStatus) {
    if (!this.isReadOnly) {
      if (toStatus == null) {
        toStatus = this.toStatus;
      }
      Swal.fire({
        title: "Are you sure?",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Confirm",
        cancelButtonText: "Back",
      }).then((willChange) => {
        if (willChange.value) {
          this.store.dispatch(new StudyStatus.Update(toStatus)).subscribe(
            (completed) => {
              this.closeModal();
              toastr.success("Study status updated.", "Success", this.toastrSettings);
              let readonly = true;
              if (this.curator) readonly = false;
              if (toStatus === 'Submitted') readonly = false;
              this.editorService.loadStudyNgxs(this.requestedStudy, false);

            }, (error) => {
              this.closeModal();
              this.toStatus = this.status;
              let message = null;
              typeof error.json === 'function' ? message = error.json().message : "Could not update study status."
              Swal.fire({
                title: message
              })
            }
          )
        }
      })
    }
  }

  ngOnInit() {}

  openModal() {
    if  (this.curator){
      this.isModalOpen = true;
    } else {
      if (this.status != null && this.status.toLowerCase() === "submitted") {
        if (this.validation.status === 'error' || this.validation.status === 'not ready') {
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

  closeModal() {
    this.isModalOpen = false;
  }
}

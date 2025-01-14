import {
  Component,
  inject,
  OnInit
} from "@angular/core";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { filter, Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { StudyStatus } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { Loading, SetLoadingInfo } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { ViolationType } from "../validations-v2/interfaces/validation-report.types";

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



  isReadOnly = false;

  isModalOpen = false;
  isFormBusy = false;
  status: string = null;
  curator = false;
  toStatus = "Submitted";
  curationRequest: string = null;
  requestedStudy: string = null;

  validationStatus: ViolationType = null;

  private toastrSettings: Record<string, any> = {}
  constructor(
    private editorService: EditorService,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
  ) {
      this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings = value;
    })

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

          this.store.dispatch(new Loading.Enable())
          this.store.dispatch(new SetLoadingInfo("Updating study status ..."))
          this.closeModal();
          this.store.dispatch(new StudyStatus.Update(toStatus)).subscribe(
            (completed) => {

            }, (error) => {
              this.closeModal();
              this.store.dispatch(new Loading.Disable())
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

        if (this.validationStatus === 'ERROR' || this.validationStatus === null) {
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

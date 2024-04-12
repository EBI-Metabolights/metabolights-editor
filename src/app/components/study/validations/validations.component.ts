import { AfterViewInit, Component, OnInit } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { ConfigurationService } from "src/app/configuration.service";
import { IValidationSummary, IValidationSummaryWrapper } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { ValidationStatusTransformPipe } from "./validation-status-transform.pipe";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select, Store } from "@ngxs/store";
import { environment } from "src/environments/environment";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { ValidationReport } from "src/app/ngxs-store/study/validation/validation.actions";

@Component({
  selector: "study-validations",
  templateUrl: "./validations.component.html",
  styleUrls: ["./validations.component.css"],
})
export class ValidationsComponent implements OnInit, AfterViewInit {

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>
  @Select(ValidationState.report) studyValidation$: Observable<IValidationSummary>;
  @Select(UserState.isCurator) isCurator$: Observable<boolean>


  validationMessageTransform = new ValidationStatusTransformPipe();
  requestedStudy: any;
  studyValidation: IValidationSummary;
  noValidationsfound: any = null;
  displayOption = "error";
  validationStatusClass: string;
  defaultToastrOptions: any = {
    timeOut: "2500",
    positionClass: "toast-top-center",
    preventDuplicates: true,
    extendedTimeOut: 0,
    tapToDismiss: false,
  };
  startValidationTaskUrl: string;
  getValidationTaskStatusUrl: string;
  /**Extraordinary bad practice to have a testing flag, but attempts to mock out the select have failed.
   * The state library itself is also long unmaintained. */
  isTesting = false;

  curator = false;

  validationReportLoadSubscription: any;
  validationReportPollInvertal: any;

  constructor(
    private editorService: EditorService,
    public configService: ConfigurationService,
    private store: Store) {}

  ngOnInit() {

  }

  ngAfterViewInit() {
   this.setUpSubscriptionsNgxs()
  }

  setUpSubscriptionsNgxs() {
    this.studyValidation$.subscribe((value) => {
      if (value) {
        this.studyValidation = value;
        if (this.studyValidation.status === 'error'){
          this.validationStatusClass = "is-danger";
        } else if (this.studyValidation.status === 'success'){
          this.validationStatusClass = "is-success";
        } else if (this.studyValidation.status === 'warning'){
            this.validationStatusClass = "is-success";
        } else if (this.studyValidation.status === 'not ready'){
          this.validationStatusClass = "is-warning";
        } else {
          this.validationStatusClass = "is-warning";
        }
      }
    });
    this.isCurator$.subscribe((value) => {
      if (value !== null) {
        this.curator = value;
      }
    });
    this.studyIdentifier$.subscribe((value) => {
      this.requestedStudy = value;
      this.startValidationTaskUrl = this.configService.config.metabolightsWSURL.baseURL
        + "/studies/" + this.requestedStudy + "/validation-task";
      this.getValidationTaskStatusUrl = this.configService.config.metabolightsWSURL.baseURL
      + "/studies/" + this.requestedStudy + "/validation-task";
    });
  }

  statusMessage(){
    return this.studyValidation ? this.validationMessageTransform.transform(this.studyValidation.status) : "";
  }

  // ADJUST POST STATE MIGRATION
  refreshValidations() {
    if (environment.useNewState) {
      this.store.dispatch(new ValidationReport.Refresh()).subscribe(
        (completed) => {
          toastr.success("Validation run submitted.", "Success", this.defaultToastrOptions);
        }, 
        (error) => {
          toastr.success(
            "Validation refresh job is submitted. If your study is large, validations will take some time to refresh." +
              "If your study validations are not refreshing please contact us.",
            "Success",
            this.defaultToastrOptions
          );
        }
      )
     }

  }


  // ADJUST POST STATE MIGRATION
  overrideValidation(validation) {
    const data = {
      validations: [],
    };
    const valSeq = validation.val_sequence;
    const valDescription = validation.message;
    const payload = {};
    payload[valSeq] = valDescription;
    data.validations.push(payload);
    this.store.dispatch(new ValidationReport.Override(data)).subscribe(
      (completed) => {
        toastr.success("SUCCESS", "Successfully overriden the validation", this.defaultToastrOptions);
      },
      (error) => {
        toastr.error("Validation override failed.", "Error", this.defaultToastrOptions);
      }
    )
     

  }



  validationTaskDone($event) {
    this.store.dispatch(new ValidationReport.ContinualRetry(10))

  }
}

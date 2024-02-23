import { AfterViewInit, Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { failedValidation } from "src/app/models/mtbl/mtbls/mocks/mock-validation";
import { ConfigurationService } from "src/app/configuration.service";
import { IValidationSummary, IValidationSummaryWrapper } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { retry } from "rxjs-compat/operator/retry";
import { ValidationStatusTransformPipe } from "./validation-status-transform.pipe";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata.state";
import { Select } from "@ngxs/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "study-validations",
  templateUrl: "./validations.component.html",
  styleUrls: ["./validations.component.css"],
})
export class ValidationsComponent implements OnInit, AfterViewInit {
  @select((state) => state.study.validation) validation: any;
  @select((state) => state.status.isCurator) isCurator;
  @select((state) => state.study.identifier) studyIdentifier: any;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>

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

  constructor(private editorService: EditorService,
    public configService: ConfigurationService) {}

  ngOnInit() {

  }

  ngAfterViewInit() {
   environment.useNewState ? this.setUpSubscriptionsNgxs() : this.setUpSubscriptions();
  }

  setUpSubscriptions() {
    this.validation.subscribe((value) => {
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
    this.isCurator.subscribe((value) => {
      if (value !== null) {
        this.curator = value;
      }
    });
    this.studyIdentifier.subscribe((value) => {
      this.requestedStudy = value;
      this.startValidationTaskUrl = this.configService.config.metabolightsWSURL.baseURL
        + "/studies/" + this.requestedStudy + "/validation-task";
      this.getValidationTaskStatusUrl = this.configService.config.metabolightsWSURL.baseURL
      + "/studies/" + this.requestedStudy + "/validation-task";
    });
  }

  setUpSubscriptionsNgxs() {
    this.validation.subscribe((value) => {
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
    this.isCurator.subscribe((value) => {
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
  refreshValidations() {
    this.editorService.refreshValidations().subscribe(
      (res) => {
        this.editorService.loadValidations();
        toastr.success(res.success, "Success", this.defaultToastrOptions);
      },
      (err) => {
        toastr.success(
          "Validation refresh job is submitted. If your study is large, validations will take some time to refresh." +
            "If your study validations are not refreshing please contact us.",
          "Success",
          this.defaultToastrOptions
        );
      }
    );
  }

  overrideValidation(validation) {
    const data = {
      validations: [],
    };
    const valSeq = validation.val_sequence;
    const valDescription = validation.message;
    const payload = {};
    payload[valSeq] = valDescription;
    data.validations.push(payload);
    this.editorService.overrideValidations(data).subscribe(
      (res) => {
        toastr.success(
          res.success,
          "Successfully overriden the validation",
          this.defaultToastrOptions
        );
        // this.refreshValidations();
      },
      (err) => {
        toastr.error(
          "Validation override failed",
          "Error",
          this.defaultToastrOptions
        );
      }
    );
  }

  /**
   * Handle a saved comment
   *
   * @param $event - The comment emitted from a child component
   * @param detail - the validation detail that the comment pertains to
   */
  handleCommentSaved($event, detail) {
    console.log($event, detail);
    const data = {
      comments: [],
    };
    const payload = {};
    payload[detail.val_sequence] = $event.comment;
    data.comments.push(payload);

    console.log(data);
    this.editorService.addComment(data).subscribe((res) => {
      toastr.success(
        res.success,
        "Successfully posted the comment",
        this.defaultToastrOptions
      );
      // this.refreshValidations();
    });
  }


  validationTaskDone($event) {
    this.editorService.getValidationReportRetry(10);
  }
}

import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import * as toastr from "toastr";
import { EditorService } from "../../../../services/editor.service";
import { Select, Store } from "@ngxs/store";
import { ValidationReport } from "src/app/ngxs-store/study/validation/validation.actions";
import { filter, Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";

/* eslint-disable @typescript-eslint/naming-convention */
// linter keeps falsely identifying ternary operatorss as being pure expressions
/* eslint-disable @typescript-eslint/no-unused-expressions */
export interface ValidationDetail {
  message: string;
  section: string;
  val_sequence: string;
  status: string;
  metadata_file: string;
  value: string;
  description: string;
  val_override: string;
  val_message: string;
  comment?: string;
  [key: string]: string; // eslint-disable-line @typescript-eslint/member-ordering
}

@Component({
  selector: "app-validation-detail",
  templateUrl: "./validation-detail.component.html",
  styleUrls: ["./validation-detail.component.css"],
})
export class ValidationDetailComponent implements OnInit, OnChanges {
  @Input() isCurator: boolean;
  @Input() validationDetail: ValidationDetail;
  @Output() commentSaved: EventEmitter<{ comment: string }> =
    new EventEmitter();
  
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  studyId: string = null;

  /**Validation detail rendering flags */
  panelOpenState = true;
  disabled: boolean = null;
  hasDescription = false;

  displayOption = "error";
  defaultToastrOptions: any = {
    timeOut: "2500",
    positionClass: "toast-top-center",
    preventDuplicates: true,
    extendedTimeOut: 0,
    tapToDismiss: false,
  };
  // whether comment box is visible.
  visible = false;
  // whether the comment button is visible
  showCommentButton = false;

  constructor(private editorService: EditorService, private store: Store) {}

  ngOnInit(): void {
    this.disabled = this.decideIfDisabled();
    this.isNotNaN(this.validationDetail.description)
      ? (this.hasDescription = true)
      : (this.hasDescription = false);
    this.studyIdentifier$.pipe(filter(value => value !== null)).subscribe((value) => {
      this.studyId = null;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.showCommentButton = this.evalCommentButton();
  }

  handleBoxClick() {
    this.visible = !this.visible;
  }


  evalCommentButton() {
    if(this.isCurator) {
      return true;
    } else {
      if (this.validationDetail.comment) {
        return true;
      } else {
        return false;
      }
    }
  }


  isNotNaN(desc): boolean {
    if (typeof desc === null) {
      return false;
    }
    if (typeof desc === undefined) {
      return false;
    }
    if (typeof desc === "string" && desc.length === 0) {
      return false;
    }
    if (typeof desc === "string" && desc.length > 0) {
      return true;
    }
  }

  /**
   * Decide whether or not to expose the comment box to the user or curator. We only want a curator to leave a comment if the validation
   *  status is error or warning. We only want the user to be able to
   *
   * @returns a boolean value indicating whether the comment box is disabled.
   */
  decideIfDisabled(): boolean {
    if (this.isCurator) {
      if (
        this.validationDetail.status === "error" ||
        this.validationDetail.status === "warning"
      ) {
        return false;
      }
    } else {
      if (this.validationDetail.comment) {
        return false;
      }
    }
    return true;
  }

  overrideValidation(validation) {
    const data = {
      validations: [],
    };
    const val_seq = validation.val_sequence;
    const val_description = validation.message;
    const payload = {};
    payload[val_seq] = val_description;
    data.validations.push(payload);
    this.store.dispatch(new ValidationReport.Override(data, this.studyId)).subscribe(
      (completed) => {
        toastr.success(
          "Success",
          "Successfully overridden the validation",
          this.defaultToastrOptions
        );
      },
      (error) => {
        toastr.error(
          "Validation override failed",
          "Error",
          this.defaultToastrOptions
        );
      }
    )

  }


  refreshValidations() {
    this.store.dispatch(new ValidationReport.Refresh(this.studyId)).subscribe((completed) => {
      toastr.success("Success", "Refreshed.", this.defaultToastrOptions);

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

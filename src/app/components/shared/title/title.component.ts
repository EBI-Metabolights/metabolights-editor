import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { IAppState } from "../../../store";
import { NgRedux, select } from "@angular-redux/store";
import { EditorService } from "../../../services/editor.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidateStudyTitle } from "./title.validator";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select, Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-title",
  templateUrl: "./title.component.html",
  styleUrls: ["./title.component.css"],
})
export class TitleComponent implements OnInit {
  @select((state) => state.study.title) studyTitle;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.validations) studyValidations: any;
  @select((state) => state.study.readonly) readonly;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(GeneralMetadataState.title) studyTitle$: Observable<string>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(ApplicationState.toastrSettings) toastrSettings$: Observable<Record<string, any>>;

  private toastrSettings: Record<string, any> = {};

  isReadOnly = false;
  requestedStudy: string = null;
  title = "";
  validations: any;
  form: FormGroup;
  isFormBusy = false;

  validationsId = "title";

  isModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>,
    private store: Store
  ) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.studyTitle.subscribe((value) => {
      if (value === "") {
        this.title = "Please add your study title here";
      } else {
        this.title = value;
        if (document.title.indexOf("|") > -1) {
          document.title = document.title.split(" | ")[0] + " | " + this.title;
        } else {
          document.title = " | " + this.title;
        }
      }
    });
    this.studyValidations.subscribe((value) => {
      this.validations = value;
    });
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
        if (document.title.indexOf("|") > -1) {
          document.title =
            this.requestedStudy + " | " + document.title.split(" | ")[1];
        } else {
          document.title = this.requestedStudy + " | ";
        }
      }
    });
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((settings) => {this.toastrSettings = settings});

    this.studyTitle$.subscribe((value) => {
      if (value === "") {
        this.title = "Please add your study title here";
      } else {
        const oldTitle = this.title
        this.title = value;
        if (document.title.indexOf("|") > -1) {
          document.title = document.title.split(" | ")[0] + " | " + this.title;
        } else {
          document.title = " | " + this.title;
        }
        if (this.isFormBusy) {
          this.form.get("title").setValue(value);
          this.form.markAsPristine();
          this.isFormBusy = false;
          toastr.success("Title updated.", "Success", this.toastrSettings);
        }

      }
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
        if (document.title.indexOf("|") > -1) {
          document.title =
            this.requestedStudy + " | " + document.title.split(" | ")[1];
        } else {
          document.title = this.requestedStudy + " | ";
        }
      }
    });
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  ngOnInit() {}

  openModal() {
    if (!this.isReadOnly) {
      this.initialiseForm();
      this.isModalOpen = true;
    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    this.form = this.fb.group({
      title: [this.title, ValidateStudyTitle(this.validation)],
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    if (!this.isReadOnly) {
      this.isFormBusy = true;
      this.editorService
        .saveTitle(this.compileBody(this.form.get("title").value))
        .subscribe(
          (res) => {
            this.form.get("title").setValue(res.title);
            this.form.markAsPristine();
            this.isFormBusy = false;
            toastr.success("Title updated.", "Success", {
              timeOut: "2500",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            });
          },
          (err) => {
            this.isFormBusy = false;
          }
        );
    }
  }

  saveNgxs() {
    if (!this.isReadOnly) {
      this.isFormBusy = true;
      console.log('about to run action dispatch')
      this.store.dispatch(new Title.Update(this.compileBody(this.form.get("title").value)));
    }
  }

  compileBody(title) {
    return {
      title,
    };
  }

  get validation() {
    return this.validations[this.validationsId];
  }
}

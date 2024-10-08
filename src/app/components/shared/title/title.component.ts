import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
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
  form: UntypedFormGroup;
  isFormBusy = false;

  validationsId = "title";

  isModalOpen = false;

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store
  ) {
    this.setUpSubscriptionsNgxs();
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
      console.log(`title component id subscription ${value}`)
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
    this.readonly$.subscribe((value) => {
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


  saveNgxs() {
    if (!this.isReadOnly) {
      this.isFormBusy = true;
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

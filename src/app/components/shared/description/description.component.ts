import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { validateStudyDescription } from "./description.validator";
import * as toastr from "toastr";
import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";

import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { StudyAbstract } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
    selector: "mtbls-description",
    templateUrl: "./description.component.html",
    styleUrls: ["./description.component.css"],
    standalone: false
})
export class DescriptionComponent implements OnChanges, OnInit {

  @ViewChild("descriptionToCopy") descriptionToCopy!: ElementRef;
  
  studyDescription$: Observable<string> = inject(Store).select(GeneralMetadataState.description);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  isReadOnly = false;

  form: UntypedFormGroup;
  isFormBusy = false;
  description = "";
  validations: any;
  isSymbolDropdownActive = false;
  editor: any;

  validationsId = "description";

  isModalOpen = false;
  hasChanges = false;

  private toastrSettings: Record<string, any> = {};

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store
  ) {
    this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings = value;
    })
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyDescription$.subscribe((value) => {
      if (value === "") {
        this.description = "Please add your study title here";
      } else {
        this.description = value;
      }
    });
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  toggleSymbolDropdown() {
    this.isSymbolDropdownActive = !this.isSymbolDropdownActive;
  }

  addSymbol(content) {
    this.editor.focus();
    const caretPosition = this.editor.getSelection(true);
    this.editor.insertText(caretPosition, content, "user");
    this.toggleSymbolDropdown();
  }

  setEditor(editor: any) {
    this.editor = editor;
    this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      const ops = [];
      delta.ops.forEach((op) => {
        if (op.insert && typeof op.insert === "string") {
          ops.push({
            insert: op.insert,
          });
        }
      });
      delta.ops = ops;
      return delta;
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
    if (!this.isReadOnly) {
      // this.description = this.description.replace(new RegExp("<br />", 'g'), '\n')
      this.isFormBusy = false;
      this.form = this.fb.group({
        description: [
          this.description,
          validateStudyDescription(this.validation),
        ],
      });
    }
  }

  closeModal() {
    this.form = null;
    this.isModalOpen = false;
  }

  clearFormatting(target) {
    this.setFieldValue(target, this.strip(this.getFieldValue(target)));
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  strip(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  save() {
    if (!this.isReadOnly) {
      this.isFormBusy = true;
      let compiled = this.compileBody(
        this.form
          .get("description")
          .value.replace(new RegExp("\n", "g"), "<br />")
      ).description
      this.store.dispatch(new StudyAbstract.Update(compiled)).subscribe(
        (completed) => {
            this.form.get("description").setValue(compiled);
            this.form.markAsPristine();
            this.isFormBusy = false;

            toastr.success("Abstract updated.", "Success", this.toastrSettings);
        }, (error) => {
          this.isFormBusy = false;
        }
      )

    }
  }

  compileBody(description) {
    return {
      description,
    };
  }

  get validation() {
    return this.validations[this.validationsId];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value !== undefined) {
      this.description = changes.value.currentValue;
    }
  }
  copyDescription() {
    const text = this.descriptionToCopy.nativeElement.innerText;
    this.editorService.copyContent(text);
  }
}

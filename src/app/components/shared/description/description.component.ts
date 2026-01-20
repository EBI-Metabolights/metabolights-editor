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
  private initialPlaceholders = [
    "Please update the study abstract/description",
    "Please add your study description here"
  ];
  private guidanceText =
    "Similar to a manuscript, the study abstract or description of your study should be updated with a concise summary that outlines the scientific context, main objectives, experimental approach, and key results or conclusions. It should provide enough information for others to understand the scope and significance of the study without needing to consult the full publication.";

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
      // Enforce 200 character minimum if not set or lower in validation rules
      if (this.validation && this.validation.rules) {
        let minRule = this.validation.rules.find(r => r.condition === 'min');
        if (!minRule) {
          this.validation.rules.push({ condition: 'min', value: 200, error: 'Description must be at least 200 characters.' });
        } else if (minRule.value < 200) {
          minRule.value = 200;
          minRule.error = 'Description must be at least 200 characters.';
        }
      }
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


  get displayDescription(): string {
    const d = (this.description || "").toString().trim();
    if (d.length === 0) {
      return this.guidanceText;
    }
    if (this.initialPlaceholders.includes(d)) {
      return this.guidanceText;
    }
    return this.description;
  }

  isPlaceholder(): boolean {
    const d = (this.description || "").toString().trim();
    return d.length === 0 || this.initialPlaceholders.includes(d);
  }
}

import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ValidateStudyTitle } from "./title.validator";
import * as toastr from "toastr";
import { filter, Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-title",
  templateUrl: "./title.component.html",
  styleUrls: ["./title.component.css"],
})
export class TitleComponent implements OnInit {

  @ViewChild("contentToCopy") contentToCopy!: ElementRef;

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyTitle$: Observable<string> = inject(Store).select(GeneralMetadataState.title);
  mhdAccession$: Observable<string> = inject(Store).select(GeneralMetadataState.mhdAccession);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  private toastrSettings: Record<string, any> = {};

  isReadOnly = false;
  requestedStudy: string = null;
  mhdAccession: string = null;
  title = "";
  form: UntypedFormGroup;
  isFormBusy = false;

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

    this.studyTitle$.pipe(filter(val => val !== null)).subscribe((value) => {
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
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
        this.updateDocumentTitle();
      }
    });
    this.mhdAccession$.subscribe((value) => {
      this.mhdAccession = value;
      this.updateDocumentTitle();
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

  updateDocumentTitle() {
    if (this.requestedStudy) {
      const displayAcc = this.getDisplayAccession();
      if (document.title.indexOf("|") > -1) {
        document.title = displayAcc + " | " + document.title.split(" | ")[1];
      } else {
        document.title = displayAcc + " | ";
      }
    }
  }

  getDisplayAccession(): string {
    if (this.mhdAccession && this.mhdAccession !== "" && this.mhdAccession !== this.requestedStudy) {
      return `${this.mhdAccession} (${this.requestedStudy})`;
    }
    return this.requestedStudy;
  }

  get validation() {
    return this.editorService.getInvestigationFieldValidation("Study Title");
  }
  copyTitle() {
    const text = this.contentToCopy.nativeElement.innerText;
    this.editorService.copyContent(text);
  } 
}

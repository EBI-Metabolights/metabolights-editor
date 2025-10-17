import {
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormBuilder } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import Swal from "sweetalert2";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Assay } from "src/app/ngxs-store/study/assay/assay.actions";


@Component({
    selector: "add-assay",
    templateUrl: "./add-assay.component.html",
    styleUrls: ["./add-assay.component.css"],
    standalone: false
})
export class AddAssayComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);

  requestedStudy: string = null;
  validations: any = null;

  isAddAssayModalOpen = false;
  selectedAssayTechnologyOption: any = null;
  selectedAssayTypeOption: any = null;
  selectedAssayTypes: any[] = [];
  currentSelectedAssayType: any = null;
  selectedAssayVariantOption: any = null;
  selectedAssayVariantColumnOption: any = [];

  assaySetup: any = null;

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {

    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.editorValidationRules$.subscribe((value) => {
      if (value) {
        this.validations = value;
        this.assaySetup = value.assays.assaySetup;
      }
    });
  }

  ngOnInit() {}

  openAddAssayModal() {
    this.isAddAssayModalOpen = true;
  }

  closeAddAssayModal() {
    this.isAddAssayModalOpen = false;
  }

  assayTechnologyChange() {
    this.selectedAssayTypeOption = null;
    this.selectedAssayVariantOption = null;
    this.selectedAssayVariantColumnOption = [];
  }

  assayTypeChange() {
    this.selectedAssayVariantOption = null;
  }

  currentSelectedAssayTypeChange() {
    this.selectedAssayVariantOption = null;
    this.selectedAssayVariantColumnOption = [];
  }

  assayTypeVariantChange() {
    if (
      this.selectedAssayVariantOption.columns &&
      this.selectedAssayVariantOption.columns.length > 0
    ) {
      this.selectedAssayVariantColumnOption = [];
    }
  }

  assayTypeVariantColumnChange() {}

  extractAssayDetails(assay) {
    if (assay.name.split(this.requestedStudy)[1]) {
      const assayInfo = assay.name.split(this.requestedStudy)[1].split("_");
      let assaySubTechnique = null;
      let assayTechnique = null;
      let assayMainTechnique = null;
      this.assaySetup.main_techniques.forEach((mt) => {
        mt.techniques.forEach((t) => {
          if (t.sub_techniques && t.sub_techniques.length > 0) {
            t.sub_techniques.forEach((st) => {
              if (st.template === assayInfo[1]) {
                assaySubTechnique = st;
                assayTechnique = t;
                assayMainTechnique = mt;
              }
            });
          }
        });
      });
      return {
        assaySubTechnique,
        assayTechnique,
        assayMainTechnique,
      };
    }
    return {
      assaySubTechnique: "",
      assayTechnique: "",
      assayMainTechnique: "",
    };
  }

  addAssay() {
    const body = {
      assay: {
        type: this.selectedAssayVariantOption.template,
        columns: [],
      },
    };
    const tempColumns = [];
    if (this.selectedAssayVariantColumnOption.length > 0) {
      this.selectedAssayVariantColumnOption.forEach((col) => {
        tempColumns.push({
          name: col.header,
          value: col.value,
        });
      });
    }
    body.assay.columns = tempColumns;

      this.store.dispatch(new Assay.Add(body, this.requestedStudy)).subscribe(
        (completed) => {
          this.selectedAssayTypeOption = null;
          this.selectedAssayVariantOption = null;
          this.selectedAssayVariantColumnOption = [];
          this.isAddAssayModalOpen = false;
          Swal.fire({
            title: "Assay added!",
            text: "",
            type: "success",
          });
          
        }
      )
    


  }
}

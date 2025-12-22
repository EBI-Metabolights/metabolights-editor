import {
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormBuilder, Validators } from "@angular/forms";
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
  ngOnInit(): void {
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

 assayForm = this.fb.group({
  assayType: ['LC-MS'],
  measurementType: ['Untargeted Metabolite Profiling'],
  omics: ['Lipidomics'],
  chromInstrument: ['', Validators.required],
  columnType: ['reverse phase'],
  msInstrument: ['', Validators.required],
  polarity: ['positive'],
  ionSource: ['electrospray ionization'],
  analyzer: ['quadrupole time-of-flight'],
  assayId: ['01', Validators.required]
});

keywords: string[] = [
  'Tandem Mass Spectrometry',
  'Waters raw format',
  'Data-Independent acquisition'
  ];

  addKeyword() {
    const v = prompt('Enter keyword');
    if (v && v.trim() !== '') {
      this.keywords.push(v.trim());
    }
  }

  editKeyword(i: number) {
    const v = prompt('Edit keyword', this.keywords[i]);
    if (v !== null && v.trim() !== '') {
      this.keywords[i] = v.trim();
    }
  }

  removeKeyword(i: number) {
    this.keywords.splice(i, 1);
  }

get assayFileName() {
  const id = this.requestedStudy || 'MTBLSxxx';
  return `a_${id}-${this.assayForm.value.assayId}_LC-MS_untargeted_metabolite_profiling.txt`;
}

get resultFileName() {
  const id = this.requestedStudy || 'MTBLSxxx';
  return `m_${id}-${this.assayForm.value.assayId}_LC-MS.maf.tsv`;
}

saveAssay() {
  const payload = {
    ...this.assayForm.value,
    keywords: this.keywords
  };

  console.log('Create assay payload', payload);
}


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

import {
  Component,
  ViewChild,
  OnInit,
  Input,
  Inject,
  ViewChildren,
  AfterContentInit,
  QueryList,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditorService } from '../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'add-assay',
  templateUrl: './add-assay.component.html',
  styleUrls: ['./add-assay.component.css'],
})
export class AddAssayComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.validations) studyValidations;

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
    private fb: FormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.studyValidations.subscribe((value) => {
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
      const assayInfo = assay.name.split(this.requestedStudy)[1].split('_');
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
      assaySubTechnique: '',
      assayTechnique: '',
      assayMainTechnique: '',
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

    this.editorService.addAssay(body).subscribe((res) => {
      this.selectedAssayTypeOption = null;
      this.selectedAssayVariantOption = null;
      this.selectedAssayVariantColumnOption = [];
      this.isAddAssayModalOpen = false;
      this.editorService.loadStudyFiles(true);
      this.editorService.loadStudyProtocols();
      window.location.reload();

      Swal.fire({
        title: 'Assay added!',
        text: '',
        type: 'success',
      });
    });
  }
}

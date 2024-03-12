import {
  Component,
  OnInit,
  Input,
  Output,
  Inject,
  ViewChild,
  SimpleChanges,
  EventEmitter,
} from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { IAppState } from "../../../../store";
import * as toastr from "toastr";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import { MTBLSFactor } from "./../../../../models/mtbl/mtbls/mtbls-factor";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "mtbls-factor",
  templateUrl: "./factor.component.html",
  styleUrls: ["./factor.component.css"],
})
export class FactorComponent implements OnInit {
  @Input("value") factor: MTBLSFactor;
  @Input("isDropdown") isDropdown = false;

  // this refers to the validations.json file, NOT the results of the validation pipeline for the study.
  @select((state) => state.study.validations) studyValidations: any;

  @ViewChild(OntologyComponent) factorTypeComponent: OntologyComponent;

  @Output() addFactorToSampleSheet = new EventEmitter<any>();

  @select((state) => state.study.readonly) studyReadonly;

  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  
  isStudyReadOnly = false;

  validationsId = "factors.factor";
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Factor Type";
  isModalOpen = false;
  isTimeLineModalOpen = false;
  isDeleteModalOpen = false;
  isDeleting = false;

  form: FormGroup;
  isFormBusy = false;
  addNewFactor = false;

  validationRules: any = null;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = {name: "", values: []};
    }
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.studyValidations.subscribe((value) => {
      this.validationRules = value;
    });
    this.studyReadonly.subscribe((value) => {
      if (value !== null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.editorValidationRules$.subscribe((value) => {
      this.validationRules = value;
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  ngOnInit() {
    this.editorService.loadValidations();
    if (this.factor == null) {
      this.addNewFactor = true;
      if (this.factorTypeComponent) {
        this.factorTypeComponent.values = [];
      }
    }
  }

  onChanges() {
    this.form.markAsDirty();
  }

  showHistory() {
    this.isModalOpen = false;
    this.isTimeLineModalOpen = true;
  }

  closeHistory() {
    this.isTimeLineModalOpen = false;
    this.isModalOpen = true;
  }

  openModal() {
    if (!this.isStudyReadOnly) {
      if (this.addNewFactor) {
        this.factor = new MTBLSFactor();
        if (this.factorTypeComponent) {
          this.factorTypeComponent.reset();
        }
      }
      this.initialiseForm();
      this.isModalOpen = true;
    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    this.form = this.fb.group({
      factorName: [this.factor.factorName],
    });
  }

  confirmDelete() {
    this.isModalOpen = false;
    this.isDeleteModalOpen = true;
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    if (!this.isStudyReadOnly) {
      if (this.getFieldValue("factorName") !== "") {
        this.isFormBusy = true;
        if (!this.addNewFactor) {
          this.editorService
            .updateFactor(this.factor.factorName, this.compileBody())
            .subscribe(
              (res) => {
                this.updateFactors(res, "Factor updated.");
                this.addFactorToSampleSheet.next(this.factor);
              },
              (err) => {
                this.isFormBusy = false;
              }
            );
        } else {
          const tempFactor = this.compileBody();
          this.editorService.saveFactor(tempFactor).subscribe(
            (res) => {
              this.updateFactors(res, "Factor saved.");
              this.isModalOpen = false;
              this.addFactorToSampleSheet.next(tempFactor.factor);
            },
            (err) => {
              this.isFormBusy = false;
            }
          );
        }
      }
    }
  }

  delete() {
    if (!this.isStudyReadOnly) {
      this.isDeleting = true;
      this.editorService.deleteFactor(this.factor.factorName).subscribe(
        (res) => {
          this.updateFactors(res, "Factor deleted.");
          this.isDeleteModalOpen = false;
          this.isModalOpen = false;
          this.isDeleting = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
    }
  }

  updateFactors(data, message) {
    if (!this.isStudyReadOnly) {
      this.editorService.getFactors().subscribe((res) => {
        toastr.success(message, "Success", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      });
      this.form.markAsPristine();
      this.initialiseForm();
      this.isModalOpen = true;
    }
  }

  compileBody() {
    const mtblsFactor = new MTBLSFactor();
    mtblsFactor.factorName = this.getFieldValue("factorName");
    mtblsFactor.comments = [];
    const jsonConvert: JsonConvert = new JsonConvert();
    mtblsFactor.factorType = jsonConvert.deserializeObject(
      this.factorTypeComponent.values[0],
      Ontology
    );
    return { factor: mtblsFactor.toJSON() };
  }

  get validation() {
    if (this.validationsId.includes(".")) {
      const arr = this.validationsId.split(".");
      let tempValidations = JSON.parse(JSON.stringify(this.validationRules));
      while (arr.length && (tempValidations = tempValidations[arr.shift()])) {}
      return tempValidations;
    }
    return this.validationRules[this.validationsId];
  }

  fieldValidation(fieldId) {
    return this.validation[fieldId];
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }
  controlList() {
    if (!(this.defaultControlList && this.defaultControlList.name.length > 0)
      && this.editorService.defaultControlLists && this.defaultControlListName in this.editorService.defaultControlLists){
      this.defaultControlList.values = this.editorService.defaultControlLists[this.defaultControlListName].OntologyTerm;
      this.defaultControlList.name = this.defaultControlListName;
    }
    return this.defaultControlList;
  }
}

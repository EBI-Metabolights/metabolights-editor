import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  inject,
  model,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";
import * as toastr from "toastr";
import { JsonConvert } from "json2typescript";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import { MTBLSFactor } from "./../../../../models/mtbl/mtbls/mtbls-factor";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Factors } from "src/app/ngxs-store/study/descriptors/descriptors.action";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Router } from "@angular/router";
import { OntologyComponentTrackerService } from "src/app/services/tracking/ontology-component-tracker.service";

@Component({
  selector: "mtbls-factor",
  templateUrl: "./factor.component.html",
  styleUrls: ["./factor.component.css"],
})
export class FactorComponent implements OnInit {
  @Input("value") factor: MTBLSFactor;
  @Input("isDropdown") isDropdown = false;


  @ViewChild(OntologyComponent) factorTypeComponent: OntologyComponent;

  @Output() addFactorToSampleSheet = new EventEmitter<any>();

  @Output() addFactorToSampleSheetUnitInclusive = new EventEmitter<any>();

  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);


  private toastrSettings: Record<string, any> = {};
  private studyId: string = null;

  isStudyReadOnly = false;

  validationsId = "factors.factor";
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Factor Type";

  unitSampleValidations = null;
  factorTypeValidations = null;
  factorNameValidations =  null;

  isModalOpen = false;
  isTimeLineModalOpen = false;
  isDeleteModalOpen = false;
  isDeleting = false;

  addFactorColumnVisible = false

  defaultUnitControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultUnitControlListName = "unit";
  fieldValues: Record<string, any> = {};

  editingFactor: boolean = false;

  form: UntypedFormGroup;
  isFormBusy = false;
  addNewFactor = false;
  baseHref: string;
  validationRules: any = null;

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store,
    private router: Router,
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = {name: "", values: []};
    }
    this.setUpSubscriptionsNgxs();
    this.baseHref = editorService.baseHref
  }

  navigateToSamples() {
    let samplesLoc = window.location.href.replace('descriptors', 'samples')
    window.location.href = samplesLoc;
  }

  toggleUnit() {
    this.addFactorColumnVisible = !this.addFactorColumnVisible;
  }



  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe(
      (id) => {
        this.studyId = id;
      })
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings;
    });

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
    this.unitSampleValidations = this.fieldValidation('unit', true);
    this.factorTypeValidations = this.fieldValidation('factorType');
    this.factorNameValidations = this.fieldValidation('factorName');
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

  openModal(editing: boolean = false) {
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
    this.form.valueChanges.subscribe((values) => {
      for (const key in values) {
        this.fieldValues[key] = values[key];
      }
    })
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

  saveNgxs() {
    if(!this.isStudyReadOnly && this.getFieldValue("factorName") !== "") {
      this.isFormBusy = true;
      if (!this.addNewFactor) { // if we are updating an existing factor
        this.store.dispatch(new Factors.Update(this.studyId, this.factor.factorName, this.compileBody())).subscribe(
          (completed) => {
            this.refreshFactors(null, "Factor updated.");
            
            if (this.addFactorColumnVisible) this.addFactorToSampleSheetUnitInclusive.next(this.factor)
            else this.addFactorToSampleSheet.next(this.factor);
            },
          (error) => { this.isFormBusy = false;}

        );
      } else { // if we are adding a new factor
        const newFactor =  this.compileBody()
        this.store.dispatch(new Factors.Add(this.studyId, newFactor)).subscribe(
          (completed) => {
            this.refreshFactors(null, "Factor saved.");
            this.isModalOpen = false;
            //
            if (this.addFactorColumnVisible) this.addFactorToSampleSheetUnitInclusive.next(newFactor.factor)
            else this.addFactorToSampleSheet.next(newFactor.factor);
          },
          (error) => { this.isFormBusy = false; }
        )

      }
      //this.factor = null;
      this.addFactorColumnVisible = false;
    }
    if (this.addFactorColumnVisible) {

    }
  }


  delete() {
    if (!this.isStudyReadOnly) {
      this.store.dispatch(new Factors.Delete(this.studyId, this.factor.factorName)).subscribe(
        (completed) => {
          this.refreshFactors(null, "Factor deleted.");
          this.isDeleteModalOpen = false;
          this.isModalOpen = false;
          this.isDeleting = false;
        },
        (error) => {
          this.isFormBusy = false;
        }
      )
    }
  }

  refreshFactors(data, message) {
    if(!this.isStudyReadOnly) {
      this.store.dispatch(new Factors.Get(this.studyId)).subscribe(
        (completed) => {
          toastr.success(message, "Success", this.toastrSettings);
          this.form.markAsPristine();
          this.initialiseForm();
          this.isModalOpen = true;
        }
      )
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

  fieldValidation(fieldId, setToSamples: boolean = false) {
    if (setToSamples) return this.validationRules['samples'][fieldId]
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

  factorColumnControlList() {
    let controlList = this.defaultUnitControlList;
    let controlListName = this.defaultUnitControlListName;

    if (!(controlList && controlList.name.length > 0)
      && this.editorService.defaultControlLists && controlListName in this.editorService.defaultControlLists){
        controlList.values = this.editorService.defaultControlLists[controlListName].OntologyTerm;
        controlList.name = controlListName;
    }
    return controlList;
  }


}

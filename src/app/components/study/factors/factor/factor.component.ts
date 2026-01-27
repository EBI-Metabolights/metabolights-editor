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
import { MTBLSComment } from "./../../../../models/mtbl/mtbls/common/mtbls-comment";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { filter, Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Factors } from "src/app/ngxs-store/study/descriptors/descriptors.action";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Router } from "@angular/router";
import { OntologyComponentTrackerService } from "src/app/services/tracking/ontology-component-tracker.service";
import { getValidationRuleForField, MetabolightsFieldControls, StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";

@Component({
  selector: "mtbls-factor",
  templateUrl: "./factor.component.html",
  styleUrls: ["./factor.component.css"],
})
export class FactorComponent implements OnInit {
  @Input("value") factor: MTBLSFactor;
  @Input("isDropdown") isDropdown = false;
  @Input("isSampleSheet") isSampleSheet = false;
  @Input("mode") mode: 'store' | 'local' = 'store';

  @ViewChild('factorType') factorTypeComponent: OntologyComponent;
  @ViewChild('factorUnit') factorUnitComponent: OntologyComponent;

  @Output() addFactorToSampleSheet = new EventEmitter<any>();
  @Output() addFactorToSampleSheetUnitInclusive = new EventEmitter<any>();
  @Output() saved = new EventEmitter<MTBLSFactor>();
  @Output() deleted = new EventEmitter<MTBLSFactor>();

  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  sampleTemplate$: Observable<string> = inject(Store).select(
    GeneralMetadataState.sampleTemplate
  );
  studyCreatedAt$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCreatedAt
  );
  studyCategory$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCategory
  );
  templateVersion$: Observable<string> = inject(Store).select(
    GeneralMetadataState.templateVersion
  );

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
  defaultUnitControlListName = "Unit";
  fieldValues: Record<string, any> = {};

  editingFactor: boolean = false;

  form: UntypedFormGroup;
  isFormBusy = false;
  addNewFactor = false;
  baseHref: string;
  validationRules: any = null;
  private legacyControlLists: Record<string, any[]> | null = null;
  studyCategory: any;
  templateVersion: any;
  sampleTemplate: any;
  studyCreatedAt: any;
  selectedFactorValue: any = null;
  selectedFactorUnitValue: any = null;
  _controlList: any = null;
  _controlListFactor: any = null;
  selectedFactorUnitOntoValue: Ontology[];
  selectedFactorOntoValue: Ontology[];
  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = {name: "", values: []};
    }
    this.store.select(ApplicationState.controlLists).subscribe((lists) => {
        this.legacyControlLists = lists || {};
    });
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
    this.studyIdentifier$.pipe(filter(value => value !== null)).subscribe((value) => {
        this.studyId = value;
    });
    this.sampleTemplate$.subscribe((value) => {
      this.sampleTemplate = value;
    });
    this.studyCategory$.subscribe((value) => {
      this.studyCategory = value as StudyCategoryStr;
    });
    this.templateVersion$.subscribe((value) => {
      this.templateVersion = value;
    });
    this.studyCreatedAt$.subscribe((value) => {
      this.studyCreatedAt = value;
    });
    this.toastrSettings$.subscribe((value) => {
      this.toastrSettings;
    });

    this.editorValidationRules$.subscribe((value) => {
      this.validationRules = value;
      this.unitSampleValidations = this.fieldValidation('unit', true);
      this.factorTypeValidations = this.fieldValidation('factorType');
      this.factorNameValidations = this.fieldValidation('factorName');
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
    this.form?.markAsDirty();
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
      this.addFactorColumnVisible = false;
      
      try {
        this._controlList = this.controlList();
        this._controlListFactor = this.factorColumnControlList();
      } catch (e) {
        this._controlList = null;
        this._controlListFactor = null;
      }
      
      this.initialiseForm();
      this.isModalOpen = true;

    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    if(this._controlList.renderAsDropdown) {
        this.selectedFactorValue = this.factor?.factorType?.annotationValue || '';
        this.selectedFactorOntoValue = this.factor?.factorType ? [this.factor.factorType] : [];
    }
    this.form = this.fb.group({
      factorName: [this.factor.factorName],
      factorType: [],
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
    this.addFactorColumnVisible = false;
  }

  saveNgxs() {
      if (this.mode === 'local') {
          if (this.getFieldValue("factorName") !== "") {
              const body = this.compileBody();
              const jsonConvert: JsonConvert = new JsonConvert();
              this.factor = jsonConvert.deserializeObject(body.factor, MTBLSFactor);
              
              this.saved.emit(this.factor);
              this.isModalOpen = false;
              this.addFactorColumnVisible = false;
          }
          return;
      }
      
    if(!this.isStudyReadOnly && this.getFieldValue("factorName") !== "") {
      this.isFormBusy = true;
      if (!this.addNewFactor) { // if we are updating an existing factor
        this.store.dispatch(new Factors.Update(this.studyId, this.factor.factorName, this.compileBody())).subscribe(
          (completed) => {
            this.refreshFactors(null, "Factor updated.");

            if (this.addFactorColumnVisible) this.addFactorToSampleSheetUnitInclusive.next({factor: this.factor, unitId: this.resolvedName})
            else this.addFactorToSampleSheet.next(this.factor);
            },
          (error) => { this.isFormBusy = false;}

        );
      } else { // if we are adding a new factor
        const newFactor =  this.compileBody()
        this.store.dispatch(new Factors.Add(this.studyId, newFactor)).subscribe(
          (completed) => {
           setTimeout(() => {
              this.refreshFactors(null, "Factor saved.");
            }, 0);
            this.isModalOpen = false;
            //
            if (this.addFactorColumnVisible) this.addFactorToSampleSheetUnitInclusive.next({factor: newFactor.factor, unitId: this.resolvedName})
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
      if (this.mode === 'local') {
          this.deleted.emit(this.factor);
          this.isDeleteModalOpen = false;
          this.isModalOpen = false;
          this.isDeleting = false;
          return;
      }
      
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
    
    // Add value format comments
    if (this.addFactorColumnVisible) {
      mtblsFactor.comments.push(new MTBLSComment("Study Factor Value Format", "Numeric"));
      
      const factorUnitValue =
        this.factorUnitComponent?.id === "factorUnit" &&
        this.factorUnitComponent?.values?.[0]
          ? this.factorUnitComponent.values[0]
          : this.selectedFactorUnitOntoValue?.[0];
      
      if (factorUnitValue) {
        mtblsFactor.comments.push(new MTBLSComment("Unit Term", factorUnitValue.annotationValue || ""));
        mtblsFactor.comments.push(new MTBLSComment("Unit Term Source REF", factorUnitValue.termSource?.name || ""));
        mtblsFactor.comments.push(new MTBLSComment("Unit Term Accession Number", factorUnitValue.termAccession || ""));
      }
    } else {
      mtblsFactor.comments.push(new MTBLSComment("Study Factor Value Format", "Ontology"));
    }

    const jsonConvert: JsonConvert = new JsonConvert();
    const factorTypeValue =
      this.factorTypeComponent?.id === "factorType" &&
      this.factorTypeComponent?.values?.[0]
        ? this.factorTypeComponent.values[0]
        : this.selectedFactorOntoValue?.[0];
    mtblsFactor.factorType = jsonConvert.deserializeObject(
      factorTypeValue,
      Ontology
    );
    return { factor: mtblsFactor.toJSON() };
  }

  get resolvedName(): string {
    return this.addNewFactor
      ? this.fieldValues['factorName']
      : this.factor.factorName;
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
    if (this.validationRules != null) {
      if (setToSamples) return this.validationRules['samples'][fieldId]
      return this.validation[fieldId];
    }
    return {name: '', values: []};

  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }
  controlList() {
        if (!(this.defaultControlList && this.defaultControlList.name.length > 0)
          && this.editorService.defaultControlLists && this.defaultControlListName in this.editorService.defaultControlLists) {
          this.defaultControlList.values = this.editorService.defaultControlLists[this.defaultControlListName].OntologyTerm;
          this.defaultControlList.name = this.defaultControlListName;
        }
  
        
        let defaultOntologies = {};
          if (this.legacyControlLists && this.legacyControlLists.controls && this.legacyControlLists.controls["investigationFileControls"] && this.legacyControlLists.controls["investigationFileControls"].__default__) {
          const defaultRule = this.legacyControlLists.controls["investigationFileControls"].__default__[0];
          defaultOntologies =  defaultRule;
        }
  
        const selectionInput = {
          studyCategory: this.studyCategory,
          studyCreatedAt: this.studyCreatedAt,
          isaFileType: "investigation" as any,
          isaFileTemplateName: null,
          templateVersion: this.templateVersion,
        };
  
        let rule = null;
        try {
          if (
            this.legacyControlLists &&
            Object.keys(this.legacyControlLists).length > 0
          ) {
            rule = getValidationRuleForField(
              {
                controlLists: this.legacyControlLists,
              } as MetabolightsFieldControls,
              this.defaultControlListName,  
              selectionInput
            );
          }
        } catch (e) {
          rule = null;
        }
  
        let renderAsDropdown = false;
        
        if (rule) {
          if (rule.validationType === "selected-ontologies" && rule.termEnforcementLevel === "required") {
            renderAsDropdown = true;
            if (rule.terms && rule.terms.length > 0) {
              const ontologiesValues = rule.terms.map((t: any) => {
                const o = new Ontology();
                o.annotationValue = t.term;
                o.termAccession = t.termAccessionNumber || "";
                o.termSource = new OntologySourceReference();
                o.termSource.name = t.termSourceRef || "";
                o.termSource.description = "";
                o.termSource.file = "";
                o.termSource.version = "";
                o.termSource.provenance_name = "";
                return o;
              });
              this.defaultControlList.values = ontologiesValues; // Override with rule terms
            }
          }
        }
        
        const result = {
          ...this.defaultControlList,
          rule,
          defaultOntologies,
          renderAsDropdown,
        };
        this._controlList = result;
        return result;
      }
    
      factorColumnControlList() {
        let controlList = this.defaultUnitControlList;
        let controlListName = this.defaultUnitControlListName;
  
        if (!(controlList && controlList.name.length > 0)
          && this.editorService.defaultControlLists && controlListName in this.editorService.defaultControlLists) {
          controlList.values = this.editorService.defaultControlLists[controlListName].OntologyTerm;
          controlList.name = controlListName;
        }
  
        let defaultOntologies = {};
        if (this.legacyControlLists && this.legacyControlLists.controls && this.legacyControlLists.controls["sampleFileControls"] && this.legacyControlLists.controls["sampleFileControls"].__default__) {
          const defaultRule = this.legacyControlLists.controls["sampleFileControls"].__default__[0];
          defaultOntologies = defaultRule;
        }
  
        const selectionInput = {
          studyCategory: this.studyCategory,
          studyCreatedAt: new Date(),
          isaFileType: "sample" as any,
          isaFileTemplateName: this.sampleTemplate,
          templateVersion: this.templateVersion,
        };
  
        let rule = null;
        try {
          if (
            this.legacyControlLists &&
            Object.keys(this.legacyControlLists).length > 0
          ) {
            rule = getValidationRuleForField(
              {
                controlLists: this.legacyControlLists,
              } as MetabolightsFieldControls,
              controlListName,  
              selectionInput
            );
          }
        } catch (e) {
          rule = null;
        }
         let renderAsDropdown = false;
                 
        if (rule) {
          if (rule.validationType === "selected-ontologies" && rule.termEnforcementLevel === "required") {
            renderAsDropdown = true;
            if (rule.terms && rule.terms.length > 0) {
              const ontologiesValues = rule.terms.map((t: any) => {
                const o = new Ontology();
                o.annotationValue = t.term;
                o.termAccession = t.termAccessionNumber || "";
                o.termSource = new OntologySourceReference();
                o.termSource.name = t.termSourceRef || "";
                o.termSource.description = "";
                o.termSource.file = "";
                o.termSource.version = "";
                o.termSource.provenance_name = "";
                return o;
              });
              this.defaultUnitControlList.values = ontologiesValues; // Override with rule terms
            }
          }
        }
        
        const result = {
          ...this.defaultUnitControlList,
          rule,
          defaultOntologies,
          renderAsDropdown,
        };
        this._controlListFactor = result;
        return result;
      }
 onDropdownChange(event: any) {
    const ont = new Ontology();
    ont.annotationValue = event.value;
    ont.termSource = new OntologySourceReference();
    this.selectedFactorOntoValue = [ont];
    this.selectedFactorValue = event.value;
  }
  onDropdownChangeFactor(event: any) {
    const ont = new Ontology();
    ont.annotationValue = event.value;
     ont.termSource = new OntologySourceReference();
    this.selectedFactorUnitOntoValue = [ont];
    this.selectedFactorUnitValue = event.value;
  }
}

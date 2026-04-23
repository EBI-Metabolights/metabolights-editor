import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as toastr from "toastr";
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { filter, Observable, take, withLatestFrom } from 'rxjs';
import { MTBLSFactor } from 'src/app/models/mtbl/mtbls/mtbls-factor';
import { ApplicationState } from 'src/app/ngxs-store/non-study/application/application.state';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { EditorService } from 'src/app/services/editor.service';
import { OntologyComponent } from '../ontology/ontology.component';
import { Factors } from 'src/app/ngxs-store/study/descriptors/descriptors.action';
import { JsonConvert } from 'json2typescript';
import { Ontology } from 'src/app/models/mtbl/mtbls/common/mtbls-ontology';
import { SampleState } from 'src/app/ngxs-store/study/samples/samples.state';
import { IsaTabFileType, StudyCategoryStr } from 'src/app/models/mtbl/mtbls/control-list';
import { OntologySourceReference } from 'src/app/models/mtbl/mtbls/common/mtbls-ontology-reference';


@Component({
  selector: 'mtbls-factorlist',
  templateUrl: './factorlist.component.html',
  styleUrls: ['./factorlist.component.css']
})
export class FactorlistComponent implements OnInit {
    @Input("value") factor: MTBLSFactor;
    @Input("isDropdown") isDropdown = false;
  
  
    @ViewChild(OntologyComponent) factorTypeComponent: OntologyComponent;
  
    @Output() addFactorToSampleSheet = new EventEmitter<any>();
  
    @Output() addFactorToSampleSheetUnitInclusive = new EventEmitter<any>();
  
    readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
    toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
    studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
    studySamples$: Observable<Record<string, any>> = inject(Store).select(SampleState.samples);
    
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
    _controlList: any = null;
    isStudyReadOnly = false;
    selectedFactorValue: any = null;
    selectedFactorOntoValue: Ontology[];
    validationsId = "factors.factor";
    defaultControlList: {name: string; values: any[]} = {name: "", values: []};
    defaultControlListName = "Study Factor Type";
  
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
    private legacyControlLists: Record<string, any[]> | null = null;
    studyCategory: any;
    templateVersion: any;
    studyCreatedAt: any;
  
    constructor(
      private fb: UntypedFormBuilder,
      private editorService: EditorService,
      private store: Store,
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
      this.readonly$.subscribe((value) => {
        if (value !== null) {
          this.isStudyReadOnly = value;
        }
      });
      this.refreshSamplesTableWithoutPopup();
    }
  
    ngOnInit() {
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

        try {
        this._controlList = this.controlList();
      } catch (e) {
        this._controlList = null;
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
        factorType: [this.factorTypeComponent ? this.factorTypeComponent.values[0] : (this.selectedFactorValue ? this.selectedFactorValue : "")],
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
    
    refreshSamplesTableWithoutPopup() {
      this.studySamples$
        .pipe(withLatestFrom(this.studyIdentifier$), take(1))
        .subscribe(([, studyIdentifierValue]) => {
          this.editorService.loadStudySamplesWithoutPopup(studyIdentifierValue);
      });
    }  
    refreshSamplesTable() {
      this.studySamples$
        .pipe(withLatestFrom(this.studyIdentifier$), take(1))
        .subscribe(([, studyIdentifierValue]) => {
          this.editorService.loadStudySamples(studyIdentifierValue);
      });
    }    

    saveNgxs() {
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
              this.refreshFactors(null, "Factor saved.");
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
            this.refreshSamplesTable();
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
        this.factorTypeComponent?.values[0] || this.selectedFactorOntoValue[0],
        Ontology
      );
      return { factor: mtblsFactor.toJSON() };
    }
  
    get resolvedName(): string {
      return this.addNewFactor
        ? this.fieldValues['factorName']
        : this.factor.factorName;
    }
  
    private getFieldContext(fileType: IsaTabFileType = 'investigation') {
      return {
        studyCategory: this.studyCategory,
        studyCreatedAt: this.studyCreatedAt,
        templateVersion: this.templateVersion,
        sampleTemplate: fileType === 'sample' ? null : null,
      };
    }

    private getValidationFieldName(fieldId: string): string {
      const fieldMapping = {
        factorName: 'Study Factor Name',
        factorType: 'Study Factor Type',
        unit: 'Unit',
      };
      return fieldMapping[fieldId] || fieldId;
    }

    private getValidationConfig(fieldId: string) {
      const isSampleField = fieldId === 'unit';
      const fileType: IsaTabFileType = isSampleField ? 'sample' : 'investigation';
      const validationsId = isSampleField ? 'samples' : this.validationsId;
      return this.editorService.getFieldValidation(
        this.getValidationFieldName(fieldId),
        fileType,
        null,
        this.getFieldContext(fileType),
        true,
        validationsId
      );
    }

    get unitSampleValidations() {
      return this.getValidationConfig('unit');
    }

    get factorTypeValidations() {
      return this.getValidationConfig('factorType');
    }

    get factorNameValidations() {
      return this.getValidationConfig('factorName');
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
     
           const rule = this.editorService.getFieldControlRule(
             this.defaultControlListName,
             'investigation',
             null,
             this.getFieldContext()
           );
     
           let renderAsDropdown = false;
           
           if (rule) {
             if (rule.validationType === "selected-ontology-term" && rule.termEnforcementLevel === "required") {
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
    onDropdownChange(event: any) {
      const ont = new Ontology();
      ont.annotationValue = event.value;
      ont.termSource = new OntologySourceReference();
      this.selectedFactorOntoValue = [ont];
      this.selectedFactorValue = event.value;
    }     
  
    // factorColumnControlList() {
    //   let controlList = this.defaultUnitControlList;
    //   let controlListName = this.defaultUnitControlListName;

    //   if (!(controlList && controlList.name.length > 0)
    //     && this.editorService.defaultControlLists && controlListName in this.editorService.defaultControlLists) {
    //     controlList.values = this.editorService.defaultControlLists[controlListName].OntologyTerm;
    //     controlList.name = controlListName;
    //   }

    //   let defaultOntologies = [];
    //   if (this.legacyControlLists && this.legacyControlLists.controls && this.legacyControlLists.controls["sampleFileControls"] && this.legacyControlLists.controls["sampleFileControls"].__default_characteristic__) {
    //     const defaultRule = this.legacyControlLists.controls["sampleFileControls"].__default_characteristic__[0];
    //     defaultOntologies = defaultRule?.ontologies || [];
    //   }

    //   const selectionInput = {
    //     studyCategory: this.studyCategory,
    //     studyCreatedAt: new Date(),
    //     isaFileType: "sample" as any,
    //     isaFileTemplateName: this.sampleTemplate,
    //     templateVersion: this.templateVersion,
    //   };

    //   let rule = null;
    //   try {
    //     if (
    //       this.legacyControlLists &&
    //       Object.keys(this.legacyControlLists).length > 0
    //     ) {
    //       rule = getValidationRuleForField(
    //         {
    //           controlLists: this.legacyControlLists,
    //         } as MetabolightsFieldControls,
    //         controlListName,  
    //         selectionInput
    //       );
    //     }
    //   } catch (e) {
    //     rule = null;
    //   }

    //   // Return the controlList with added properties
    //   return {
    //     ...controlList,
    //     rule,
    //     defaultOntologies
    //   };
    // }
  
}

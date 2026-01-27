import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import Swal from "sweetalert2";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Assay } from "src/app/ngxs-store/study/assay/assay.actions";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";
import { MetabolightsFieldControls, getValidationRuleForField, ValidationRuleSelectionInput } from "src/app/models/mtbl/mtbls/control-list";


@Component({
  selector: "add-assay",
  templateUrl: "./add-assay.component.html",
  styleUrls: ["./add-assay.component.css"],
})
export class AddAssayComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  studyCategory$: Observable<string> = inject(Store).select(GeneralMetadataState.studyCategory);
  templateVersion$: Observable<string> = inject(Store).select(GeneralMetadataState.templateVersion);
  templateConfiguration$: Observable<any> = inject(Store).select(ApplicationState.templateConfiguration);
  assayFileHeaderTemplates$: Observable<any> = inject(Store).select(ApplicationState.assayFileHeaderTemplates);
  controlLists$: Observable<any> = inject(Store).select(ApplicationState.controlLists);

  requestedStudy: string = null;
  validations: any = null;
  studyCreatedAt: any = null;

  isAddAssayModalOpen = false;
  
  // Data for Dropdowns
  studyCategory: string = "";
  activeAssayFileTemplates: string[] = [];
  activeMeasurementTypes: any[] = [];
  activeOmicsTypes: any[] = [];
  
  
  // Configuration
  templateConfiguration: any = null;
  controlLists: any = null;
  currentTemplateVersion: string = null;

  selectedAssayTechnologyOption: any = null;
  selectedAssayTypeOption: any = null;
  selectedAssayTypes: any[] = [];
  currentSelectedAssayType: any = null;
  selectedAssayVariantOption: any = null; // This seems to be the selected assay template config
  selectedAssayVariantColumnOption: any = [];

  dynamicSections: any[] = [];
  assayHeaderTemplates: any = null;

  assaySetup: any = null;

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

  designDescriptors: Ontology[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.initDefaultDescriptors();
    this.setUpSubscriptionsNgxs();
  }
  ngOnInit(): void {
  }

  initDefaultDescriptors() {
      this.designDescriptors = [];
  }

  onDescriptorSaved(descriptor: Ontology) {
      if (!descriptor) return;
      this.designDescriptors.push(descriptor);
  }

  onDescriptorEdited(descriptor: Ontology, index: number) {
      if (index >= 0 && index < this.designDescriptors.length) {
          this.designDescriptors[index] = descriptor;
      }
  }

  removeDescriptor(index: number) {
      this.designDescriptors.splice(index, 1);
  }


  setUpSubscriptionsNgxs() {
    // Subscribe to study created date
    this.store.select(GeneralMetadataState.studyCreatedAt).subscribe(date => {
      this.studyCreatedAt = date;
    });

    combineLatest([
        this.studyIdentifier$,
        this.editorValidationRules$,
        this.studyCategory$,
        this.templateVersion$,
        this.templateConfiguration$,
        this.assayFileHeaderTemplates$,
        this.controlLists$
    ]).subscribe(([studyId, rules, studyCategoryVal, version, config, headerTemplates, controlLists]) => {
        
        // 1. Study Identifier
        if (studyId) {
            this.requestedStudy = studyId;
        }

        // 2. Validation Rules
        if (rules) {
            this.validations = rules;
            this.assaySetup = rules.assays.assaySetup;
        }

        // 3. Header Templates & Control Lists (Dependencies for Dynamic Sections)
        this.assayHeaderTemplates = headerTemplates;
        this.controlLists = controlLists;

        // 4. Configuration & Defaults
        if (config && config.versions) {
            this.templateConfiguration = config;
            this.currentTemplateVersion = version || config.defaultTemplateVersion; 
            
             // Handle Study Category Label
             if (config.studyCategories && studyCategoryVal) {
                 const categoryConfig = config.studyCategories[studyCategoryVal];
                 this.studyCategory = (categoryConfig && categoryConfig.label) ? categoryConfig.label : studyCategoryVal;
             } else {
                 this.studyCategory = studyCategoryVal;
             }

            const versionConfig = config.versions[this.currentTemplateVersion];
            if (versionConfig) {
                // Assay Types
                let assayKeys = versionConfig.activeAssayFileTemplates || [];
                if (!Array.isArray(assayKeys)) {
                     if (typeof assayKeys === 'object') {
                         assayKeys = Object.keys(assayKeys);
                     } else {
                         assayKeys = [];
                     }
                }
                 this.activeAssayFileTemplates = assayKeys;

                // Measurement Types
                const measurementKeys = (versionConfig as any).activeMeasurementTypes || [];
                this.activeMeasurementTypes = this.processOptions(measurementKeys, (config as any).measurementTypes);

                // Set Default Measurement Type: "Untargeted Metabolite Profiling"
                // Only patch if not already set (or if we want to enforce default on load)
                if (!this.assayForm.get('measurementType').value) {
                     const defaultMeasurement = this.activeMeasurementTypes.find(m => m.label === 'Untargeted Metabolite Profiling' || m.value === 'Untargeted Metabolite Profiling');
                     if (defaultMeasurement) {
                        this.assayForm.patchValue({ measurementType: defaultMeasurement.value });
                    }
                }

                // Omics Types
                const omicsKeys = (versionConfig as any).activeOmicsTypes || [];
                this.activeOmicsTypes = this.processOptions(omicsKeys, (config as any).omicsTypes);
                
                // Set Default Omics Type: "Metabolomics"
                if (!this.assayForm.get('omics').value) {
                    const defaultOmics = this.activeOmicsTypes.find(o => o.label === 'Metabolomics' || o.value === 'Metabolomics');
                     if (defaultOmics) {
                        this.assayForm.patchValue({ omics: defaultOmics.value });
                    }
                }

                // Trigger update if assay type is already selected (e.g. default)
                 const currentAssayType = this.assayForm.get('assayType').value;
                 if (currentAssayType) {
                     this.updateDynamicSections(currentAssayType);
                 }
            }
        }
    });
  }

  processOptions(keys: any, configMap: any): any[] {
      if (!keys || !configMap) return [];
      if (!Array.isArray(keys)) {
          if (typeof keys === 'object') {
               keys = Object.keys(keys);
          } else {
               return [];
          }
      }
      return keys.map(key => {
          const details = configMap[key];
          return {
              value: key,
              label: details?.label || key,
              ontology: details?.ontology || null, // Capture ontology
              order: details?.order || 0
          };
      }).sort((a, b) => a.order - b.order);
  }

  onAssayTypeChange(value) {
      this.updateDynamicSections(value);
  }

  updateDynamicSections(assayType: string) {
      console.log('updateDynamicSections called with:', assayType);
      
      if (!this.templateConfiguration || !this.currentTemplateVersion || !this.assayHeaderTemplates) {
          console.warn('Missing config deps:', {
              config: !!this.templateConfiguration, 
              version: this.currentTemplateVersion, 
              headers: !!this.assayHeaderTemplates
          });
          return;
      }

      const versionConfig = this.templateConfiguration.versions[this.currentTemplateVersion];
      if (!versionConfig) {
          console.warn('Version config not found for:', this.currentTemplateVersion);
          return;
      }

      const defaults = (versionConfig as any).activeAssayFileTemplates;
      console.log('ActiveAssayFileTemplates (as defaults) found:', defaults);
      
      if (!defaults) {
          console.warn('No activeAssayFileTemplates found in version config.');
          this.dynamicSections = [];
          return;
      }

      let assayConfig = defaults[assayType];
      
      if (!assayConfig) {
          // Try case-insensitive match
          const matchingKey = Object.keys(defaults).find(k => k.toLowerCase() === assayType.toLowerCase());
          if (matchingKey) {
              assayConfig = defaults[matchingKey];
              console.log(`Found case-insensitive match for '${assayType}': '${matchingKey}'`);
          }
      }

      if (!assayConfig || !assayConfig.assayFileDefaultValues) {
          console.warn(`No assayFileDefaultValues found for assayType '${assayType}'. AssayConfig keys:`, assayConfig ? Object.keys(assayConfig) : 'null');
          this.dynamicSections = [];
          return;
      }
      
      const sectionsMap = assayConfig.assayFileDefaultValues;
      
      
      // key from defaults might differ from assayType if case-insensitive matched
      // But we need the Header Templates for the *same* assay type (conceptually).
      // We should try to find the matching key in assayHeaderTemplates too.
      
      let headersList = this.assayHeaderTemplates[assayType];
      if (!headersList && this.assayHeaderTemplates) {
          const matchingHeaderKey = Object.keys(this.assayHeaderTemplates).find(k => k.toLowerCase() === assayType.toLowerCase());
          if (matchingHeaderKey) {
              headersList = this.assayHeaderTemplates[matchingHeaderKey];
          }
      }
      
      this.dynamicSections = Object.keys(sectionsMap).map(sectionHeader => {
          const columnNames = sectionsMap[sectionHeader];
          const fields = columnNames.map(colName => {
               if (!headersList) {
                   console.warn(`Missing headersList for assayType '${assayType}' when processing column '${colName}'`);
                   return null;
               }
               
               const template = headersList.find(t => t.version === this.currentTemplateVersion);
               if (!template) {
                   console.warn(`Template version mismatch. Current: ${this.currentTemplateVersion}, Headers available versions:`, headersList.map(h => h.version));
                   return null;
               }

               // Robust matching for column header
               // 1. Direct match
               let colDef = template.headers.find(h => h.columnHeader.trim() === colName.trim());
               
               // 2. Try matching with Parameter Value wrapper
               if (!colDef) {
                   const paramValueHeader = `Parameter Value[${colName.trim()}]`;
                   colDef = template.headers.find(h => h.columnHeader.trim() === paramValueHeader);
               }

               if (!colDef) {
                   console.warn(`Column definition not found for '${colName}'. Tried exact match and 'Parameter Value[...]'. Available headers:`, template.headers.map(h => h.columnHeader));
                   return null;
               }

               const isRequired = colDef.required;
               let fieldType = 'TEXT';
               if (colDef.columnStructure === 'ONTOLOGY_COLUMN') fieldType = 'ONTOLOGY';
               if (colDef.columnStructure === 'SINGLE_COLUMN_AND_UNIT_ONTOLOGY') fieldType = 'TEXT_AND_ONTOLOGY';

              if (!this.assayForm.contains(colDef.columnHeader)) {
                   this.assayForm.addControl(colDef.columnHeader, this.fb.control(colDef.defaultValue || '', isRequired ? Validators.required : null));
              }

               if (fieldType === 'TEXT_AND_ONTOLOGY') {
                    if (!this.assayForm.contains(colDef.columnHeader + '_unit')) {
                         this.assayForm.addControl(colDef.columnHeader + '_unit', this.fb.control(''));
                    }
               }
               
               // Resolve Rule with proper selection input
               let mainRule = null;
               if (this.controlLists) {
                   // Create selection input like table.component.ts
                   const selectionInput: ValidationRuleSelectionInput = {
                       studyCategory: this.studyCategory as any,
                       studyCreatedAt: this.studyCreatedAt,
                       isaFileType: "assay" as any,
                       isaFileTemplateName: assayType,
                       templateVersion: this.currentTemplateVersion,
                   };

                   try {
                       // 1. Try clean colName first
                       mainRule = getValidationRuleForField(
                           { controlLists: this.controlLists } as MetabolightsFieldControls,
                           colName,
                           selectionInput
                       );
                       // 2. If not found, try full column header
                       if (!mainRule && colDef.columnHeader !== colName) {
                           mainRule = getValidationRuleForField(
                               { controlLists: this.controlLists } as MetabolightsFieldControls,
                               colDef.columnHeader,
                               selectionInput
                           );
                       }
                       // 3. Fallback: extract inner value if not found
                       if (!mainRule && colDef.columnHeader.includes('[') && colDef.columnHeader.includes(']')) {
                           const regex = /\[(.*?)\]/;
                           const match = regex.exec(colDef.columnHeader);
                           if (match && match[1] && match[1] !== colName) {
                                mainRule = getValidationRuleForField(
                                   { controlLists: this.controlLists } as MetabolightsFieldControls,
                                   match[1],
                                   selectionInput
                               );
                           }
                       }
                   } catch(e) { console.warn('Error resolving rule for', colDef.columnHeader, e); }
               }

               // Determine if field should render as dropdown (like table.component.ts)
               let renderAsDropdown = false;
               if (mainRule) {
                   renderAsDropdown = mainRule.validationType === 'selected-ontology-term' && mainRule.termEnforcementLevel === 'required';
               }

               // Update Types based on Rule and columnStructure
               let mainType = fieldType === 'TEXT_AND_ONTOLOGY' ? 'TEXT' : (fieldType === 'ONTOLOGY' ? 'ONTOLOGY' : 'TEXT');
               
               if (fieldType === 'ONTOLOGY' || fieldType === 'TEXT_AND_ONTOLOGY') {
                    // Check if rule indicates ontology type
                    const isOntologyType = mainRule && [
                        'selected-ontology-term',
                        'ontology-term-in-selected-ontologies',
                        'child-ontology-term'
                    ].includes(mainRule.validationType);
                    
                    if (isOntologyType) {
                       mainType = 'ONTOLOGY';
                    }
               }

               let unitRule = null;
               if (fieldType === 'TEXT_AND_ONTOLOGY' && this.controlLists) {
                    const selectionInput: ValidationRuleSelectionInput = {
                        studyCategory: this.studyCategory as any,
                        studyCreatedAt: this.studyCreatedAt,
                        isaFileType: "assay" as any,
                        isaFileTemplateName: assayType,
                        templateVersion: this.currentTemplateVersion,
                    };
                    try {
                       unitRule = getValidationRuleForField(
                           { controlLists: this.controlLists } as MetabolightsFieldControls,
                           'unit', 
                           selectionInput
                       );
                    } catch(e) {}
               }

               return {
                   label: colName, // Clean name uses colName from the array
                   key: colDef.columnHeader,
                   required: isRequired,
                   description: colDef.description,
                   type: fieldType,
                   mainType: mainType,
                   renderAsDropdown: renderAsDropdown,
                   
                   ontology: null,
                   def: colDef,
                   validationRule: mainRule,
                   unitRule: unitRule
               };
          }).filter(f => f !== null);

          return {
              header: sectionHeader,
              fields: fields
          };
      });
  }

  onOntologyChange(value: any, key: string) {
       this.assayForm.get(key).setValue(value);
  }

  onMeasurementTypeChange(selectedOption: any) {
      if (selectedOption && selectedOption.ontology) {
          console.log("Selected Measurement Ontology:", selectedOption.ontology);
      }
  }

  onOmicsTypeChange(selectedOption: any) {
      if (selectedOption && selectedOption.ontology) {
          console.log("Selected Omics Ontology:", selectedOption.ontology);
      }
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
    const validDescriptors = this.designDescriptors.map(d => {
        if (!d.termSource) d.termSource = new OntologySourceReference();
        if (!d.comments) d.comments = [];
        return d;
    });

    const assayFileDefaultValues = [];
    this.dynamicSections.forEach(section => {
        section.fields.forEach(field => {
            const controlValue = this.assayForm.get(field.key)?.value;
            let val = null;
            let fieldFormat = 'Text';
            let unitVal = null;

            if (field.type === 'ONTOLOGY') {
                fieldFormat = 'Ontology';
                if (Array.isArray(controlValue) && controlValue.length > 0) {
                    val = controlValue[0];
                } else {
                    val = controlValue;
                }
            } else if (field.type === 'TEXT') {
               fieldFormat = 'Text';
               val = {
                   annotationValue: controlValue,
                   termSource: null,
                   termAccession: null,
                   unit: null
               };
            } else if (field.type === 'TEXT_AND_ONTOLOGY') {
                fieldFormat = 'Numeric'; // Approximate since usually it is value + unit
                
                const unitControlValue = this.assayForm.get(field.key + '_unit')?.value;
                if (Array.isArray(unitControlValue) && unitControlValue.length > 0) {
                    unitVal = unitControlValue[0];
                } else {
                    unitVal = unitControlValue;
                }

                val = {
                   annotationValue: controlValue,
                   termSource: null,
                   termAccession: null,
                   unit: unitVal
               };
            }
            
            if (val && !val.unit) val.unit = null;

            assayFileDefaultValues.push({
                fieldName: field.key,
                fieldFormat: fieldFormat,
                defaultValue: val
            });
        });
    });

    const payload = {
      selectedAssayFileTemplate: this.assayForm.get('assayType').value,
      assayIdentifier: null,
      assayResultFileType: "maf",
      assayResultFileName: null,
      selectedMeasurementType: this.assayForm.get('measurementType').value || '', 
      selectedOmicsType: this.assayForm.get('omics').value || '',
      designDescriptors: validDescriptors,
      assayFileDefaultValues: assayFileDefaultValues
    };

    console.log('Create assay payload', payload);
    
    this.store.dispatch(new Assay.Add(payload, this.requestedStudy)).subscribe(
        (completed) => {
          this.isAddAssayModalOpen = false;
          Swal.fire({
            title: "Assay added!",
            text: "",
            type: "success",
          });
        }
    );
  }


  openAddAssayModal() {
    this.isAddAssayModalOpen = true;
  }

  closeAddAssayModal() {
    this.isAddAssayModalOpen = false;
  }
}

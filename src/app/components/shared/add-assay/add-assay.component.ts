import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import Swal from "sweetalert2";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Assay, AssayList } from "src/app/ngxs-store/study/assay/assay.actions";
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
  activeAssayFileTemplates: any[] = [];
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
    assayType: ["", Validators.required],
    measurementType: ["", Validators.required],
    omics: ["", Validators.required],
    assayId: ["01", Validators.required],
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
                const assayTemplates = versionConfig.activeAssayFileTemplates || {};
                let assayKeys = [];
                if (Array.isArray(assayTemplates)) {
                    assayKeys = assayTemplates;
                } else if (typeof assayTemplates === 'object') {
                    assayKeys = Object.keys(assayTemplates);
                }
                
                // Use assayTemplates itself as the configMap if it contains labels and order
                this.activeAssayFileTemplates = this.processOptions(assayKeys, assayTemplates);

                // Filter by Study Category (Case-insensitive)
                if (this.studyCategory) {
                    const categoryLower = this.studyCategory.toLowerCase();
                    this.activeAssayFileTemplates = this.activeAssayFileTemplates.filter(item => 
                        item.value.toLowerCase().includes(categoryLower) || 
                        item.label.toLowerCase().includes(categoryLower)
                    );
                }

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

                // Set Default Assay Type (First item)
                if (!this.assayForm.get('assayType').value && this.activeAssayFileTemplates.length > 0) {
                    this.assayForm.patchValue({ assayType: this.activeAssayFileTemplates[0].value });
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
      if (!defaults) {
          this.dynamicSections = [];
          return;
      }

      let assayConfig = defaults[assayType];
      if (!assayConfig) {
          const matchingKey = Object.keys(defaults).find(k => k.toLowerCase() === assayType.toLowerCase());
          if (matchingKey) assayConfig = defaults[matchingKey];
      }

      if (!assayConfig || !assayConfig.assayFileDefaultValues) {
          this.dynamicSections = [];
          return;
      }

      const sectionsMap = assayConfig.assayFileDefaultValues;
      
      const baseControls = ['assayType', 'measurementType', 'omics', 'assayId'];
      const touchedControls = new Set<string>(baseControls);

      // Resolve Header Templates for the current assay type
      let headersList = this.assayHeaderTemplates[assayType];
      if (!headersList) {
          const matchingHeaderKey = Object.keys(this.assayHeaderTemplates).find(k => k.toLowerCase() === assayType.toLowerCase());
          if (matchingHeaderKey) headersList = this.assayHeaderTemplates[matchingHeaderKey];
      }

      this.dynamicSections = Object.keys(sectionsMap)
          .map(key => {
              const sectionData = sectionsMap[key];
              const isObject = typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData);
              const sectionLabel = isObject ? (sectionData.label || key) : key;
              const columnNames = isObject ? (sectionData.fields || []) : (Array.isArray(sectionData) ? sectionData : []);
              const order = isObject ? (sectionData.order || 99) : 99;

              const fields = columnNames.map(colName => {
                   if (!headersList) return null;
                   
                   const template = headersList.find(t => t.version === this.currentTemplateVersion);
                   if (!template) return null;

                   // Robust matching for column header
                   let colDef = template.headers.find(h => h.columnHeader.trim() === colName.trim());
                   if (!colDef) {
                       const paramValueHeader = `Parameter Value[${colName.trim()}]`;
                       colDef = template.headers.find(h => h.columnHeader.trim() === paramValueHeader);
                   }

                   if (!colDef) return null;

                   const isRequired = colDef.required;
                   let fieldType = 'TEXT';
                   if (colDef.columnStructure === 'ONTOLOGY_COLUMN') fieldType = 'ONTOLOGY';
                   if (colDef.columnStructure === 'SINGLE_COLUMN_AND_UNIT_ONTOLOGY') fieldType = 'TEXT_AND_ONTOLOGY';

                   // Dynamically add or update form controls
                   const controlName = colDef.columnHeader;
                   touchedControls.add(controlName);
                   
                   const currentControl = this.assayForm.get(controlName);
                   if (!currentControl) {
                        this.assayForm.addControl(controlName, this.fb.control(colDef.defaultValue || '', isRequired ? Validators.required : null));
                   } else {
                        currentControl.setValidators(isRequired ? Validators.required : null);
                        currentControl.updateValueAndValidity();
                   }

                   if (fieldType === 'TEXT_AND_ONTOLOGY') {
                        const unitKey = controlName + '_unit';
                        touchedControls.add(unitKey);
                        if (!this.assayForm.contains(unitKey)) {
                            this.assayForm.addControl(unitKey, this.fb.control(''));
                        }
                   }

                   // Resolve Description and Rules (Legacy Logic)
                   let description = colDef.description;
                   if (this.validations) {
                       const targetHeaders = [colDef.columnHeader, colName];
                       if (this.validations.assays && this.validations.assays.default_order) {
                           const validationEntry = this.validations.assays.default_order.find(entry => targetHeaders.includes(entry.header) || targetHeaders.includes(entry.columnDef));
                           if (validationEntry) {
                               description = validationEntry['ontology-details']?.description || validationEntry.description || description;
                           }
                       }
                   }

                   // Resolve Rule with proper selection input
                   let mainRule = null;
                   if (this.controlLists && this.controlLists.controls) {
                       const selectionInput: ValidationRuleSelectionInput = {
                           studyCategory: this.studyCategory as any,
                           studyCreatedAt: this.studyCreatedAt,
                           isaFileType: "assay" as any,
                           isaFileTemplateName: assayType,
                           templateVersion: this.currentTemplateVersion,
                       };
                       try {
                           const namesToTry = [colName, colDef.columnHeader];
                           for (const name of namesToTry) {
                               mainRule = getValidationRuleForField({ controlLists: this.controlLists } as MetabolightsFieldControls, name, selectionInput);
                               if (mainRule) break;
                           }
                       } catch(e) {}
                   }

                   let renderAsDropdown = false;
                   if (mainRule) {
                       renderAsDropdown = mainRule.validationType === 'selected-ontology-term' && mainRule.termEnforcementLevel === 'required';
                   }

                   let mainType = fieldType === 'TEXT_AND_ONTOLOGY' ? 'TEXT' : (fieldType === 'ONTOLOGY' ? 'ONTOLOGY' : 'TEXT');
                   if (fieldType === 'ONTOLOGY' || fieldType === 'TEXT_AND_ONTOLOGY') {
                        const isOntologyType = mainRule && ['selected-ontology-term', 'ontology-term-in-selected-ontologies', 'child-ontology-term'].includes(mainRule.validationType);
                        if (isOntologyType) mainType = 'ONTOLOGY';
                   }

                   let unitRule = null;
                   if (fieldType === 'TEXT_AND_ONTOLOGY' && this.controlLists && this.controlLists.controls) {
                        const selectionInput: ValidationRuleSelectionInput = {
                            studyCategory: this.studyCategory as any,
                            studyCreatedAt: this.studyCreatedAt,
                            isaFileType: "assay" as any,
                            isaFileTemplateName: assayType,
                            templateVersion: this.currentTemplateVersion,
                        };
                        try {
                           unitRule = getValidationRuleForField({ controlLists: this.controlLists } as MetabolightsFieldControls, 'unit', selectionInput);
                        } catch(e) {}
                   }

                   return {
                       label: colName,
                       key: colDef.columnHeader,
                       required: isRequired,
                       description: description,
                       placeholder: colDef.placeholder,
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
                  header: sectionLabel,
                  fields: fields,
                  order: order
              };
          })
          .sort((a, b) => a.order - b.order);

      // Final Cleanup: Remove any controls that were not touched in this cycle
      Object.keys(this.assayForm.controls).forEach(controlName => {
          if (!touchedControls.has(controlName)) {
              this.assayForm.removeControl(controlName);
          }
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
    // 1. Format Design Descriptors as per sample
    const formattedDescriptors = this.designDescriptors.map(d => {
        const dd = JSON.parse(JSON.stringify(d)); // deep clone
        if (!dd.termSource) {
            dd.termSource = {
                comments: [],
                name: "",
                file: "",
                version: "",
                description: ""
            };
        }
        // Ensure standard comments reach the backend if expected
        if (!dd.comments || dd.comments.length === 0) {
            dd.comments = [
                { name: "Assay Descriptor Category", value: "disease" },
                { name: "Assay Descriptor Source", value: "submitter" }
            ];
        }
        return dd;
    });

    // 2. Format Dynamic Fields (assayFileDefaultValues)
    const assayFileDefaultValues = [];
    this.dynamicSections.forEach(section => {
        section.fields.forEach(field => {
            const controlValue = this.assayForm.get(field.key)?.value;
            let val = null;
            let fieldFormat = 'Text';

            if (field.type === 'ONTOLOGY') {
                fieldFormat = 'Ontology';
                const ontologyVal = Array.isArray(controlValue) ? controlValue[0] : controlValue;
                if (ontologyVal) {
                    val = {
                        annotationValue: ontologyVal.annotationValue || '',
                        termSource: ontologyVal.termSource || { comments: [], name: '', file: '', version: '', description: '' },
                        termAccession: ontologyVal.termAccession || '',
                        unit: null
                    };
                }
            } else if (field.type === 'TEXT') {
               fieldFormat = 'Text';
               val = {
                   annotationValue: controlValue || '',
                   termSource: null,
                   termAccession: null,
                   unit: null
               };
            } else if (field.type === 'TEXT_AND_ONTOLOGY') {
                fieldFormat = 'Numeric'; 
                const unitControlValue = this.assayForm.get(field.key + '_unit')?.value;
                const unitOntology = Array.isArray(unitControlValue) ? unitControlValue[0] : unitControlValue;
                
                val = {
                   annotationValue: controlValue || '',
                   termSource: null,
                   termAccession: null,
                   unit: unitOntology ? {
                       annotationValue: unitOntology.annotationValue || '',
                       termSource: unitOntology.termSource || { comments: [], name: '', file: '', version: '', description: '' },
                       termAccession: unitOntology.termAccession || ''
                   } : null
               };
            }
            
            if (val) {
                assayFileDefaultValues.push({
                    fieldName: field.key, // Should already be "Parameter Value[...]" from colDef.columnHeader
                    fieldFormat: fieldFormat,
                    defaultValue: val
                });
            }
        });
    });

    const payload = {
      selectedAssayFileTemplate: this.assayForm.get('assayType').value,
      assayIdentifier: null,
      assayResultFileType: "maf",
      assayResultFileName: null,
      selectedMeasurementType: this.assayForm.get('measurementType').value || '', 
      selectedOmicsType: this.assayForm.get('omics').value || '',
      designDescriptors: formattedDescriptors,
      assayFileDefaultValues: assayFileDefaultValues
    };

    console.log('Final Payload for API:', payload);
    
    this.editorService.addAssay(this.requestedStudy, payload).subscribe(
        (response) => {
          this.isAddAssayModalOpen = false;
          Swal.fire({
            title: "Assay added!",
            text: "Your assay has been successfully created.",
            type: "success",
            confirmButtonColor: "#10c1e5",
          });
          // Optionally trigger a refresh of the assay list here
          this.store.dispatch(new AssayList.Get(this.requestedStudy));
        },
        (error) => {
          console.error('API Error:', error);
          Swal.fire({
            title: "Error creating assay",
            text: error.message || "An unexpected error occurred while creating the assay.",
            type: "error",
            confirmButtonColor: "#DD6B55",
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

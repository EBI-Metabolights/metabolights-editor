import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
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
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";


@Component({
  selector: "add-assay",
  templateUrl: "./add-assay.component.html",
  styleUrls: ["./add-assay.component.css"],
})
export class AddAssayComponent implements OnInit, OnChanges {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.studyRules);
  studyCategory$: Observable<string> = inject(Store).select(GeneralMetadataState.studyCategory);
  templateVersion$: Observable<string> = inject(Store).select(GeneralMetadataState.templateVersion);
  templateConfiguration$: Observable<any> = inject(Store).select(ApplicationState.templateConfiguration);
  assayFileHeaderTemplates$: Observable<any> = inject(Store).select(ApplicationState.assayFileHeaderTemplates);
  controlLists$: Observable<any> = inject(Store).select(ApplicationState.controlLists);
  
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() assayData: any = null;

  requestedStudy: string = null;
  validations: any = null;
  studyCreatedAt: any = null;

  isAddAssayModalOpen = false;
  
  // Data for Dropdowns
  studyCategory: string = "";
  studyCategoryLabel: string = "";
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
    assayId: ["01"],
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
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.assayData && this.mode === 'edit' && this.assayData && this.activeAssayFileTemplates.length > 0) {
        this.populateFormFromComments();
    }
  }

  populateFormFromComments() {
    if (!this.assayData || !this.assayData.comments) return;

    const comments = this.assayData.comments;
    const getValue = (name: string) => comments.find(c => c.name === name)?.value || "";

    const assayTypeComment = getValue('Assay Type').trim();
    const assayTypeLabelComment = getValue('Assay Type Label').trim();
    
    // 1. Match Assay Type against available templates
    let assayType = "";
    const searchMatch = (opt: any, searchStr: string) => {
        if (!searchStr) return false;
        const lowerSearch = searchStr.toLowerCase();
        return (opt.value && opt.value.toLowerCase() === lowerSearch) || 
               (opt.label && opt.label.toLowerCase() === lowerSearch);
    };

    const matchedAssayOption = this.activeAssayFileTemplates.find(a => 
        searchMatch(a, assayTypeComment) || searchMatch(a, assayTypeLabelComment)
    );
    
    if (matchedAssayOption) {
        assayType = matchedAssayOption.value;
    } else if (assayTypeComment || assayTypeLabelComment) {
        const fallbackValue = assayTypeComment || assayTypeLabelComment;
        // Check if already in list to avoid duplicates
        if (!this.activeAssayFileTemplates.find(a => searchMatch(a, fallbackValue))) {
            this.activeAssayFileTemplates.push({ value: fallbackValue, label: fallbackValue });
        }
        assayType = fallbackValue;
    }

    // Ensure dynamic sections (measurement types, etc.) are populated for this assayType
    if (assayType) {
        this.updateDynamicSections(assayType);
    }

    // 2. Match Measurement Type
    const measurementTypeComment = getValue('Measurement Type').trim();
    const measurementTypeAnnotation = this.assayData.measurementType?.annotationValue || "";
    let measurementType = "";
    const measurementOption = this.activeMeasurementTypes.find(m => 
        searchMatch(m, measurementTypeComment) || 
        searchMatch(m, measurementTypeAnnotation) || 
        searchMatch(m, assayTypeLabelComment)
    );
    if (measurementOption) {
        measurementType = measurementOption.value;
    } else if (measurementTypeAnnotation || measurementTypeComment) {
        measurementType = measurementTypeAnnotation || measurementTypeComment;
    }

    // 3. Match Omics
    const omicsCommentRaw = getValue('Omics Type').trim();
    let omics = "";
    const omicsOption = this.activeOmicsTypes.find(o => 
        searchMatch(o, omicsCommentRaw)
    );
    if (omicsOption) {
        omics = omicsOption.value;
    }

    // Extract assayId from filename: a_MTBLSxxx-01_...
    let assayId = "01";
    if (this.assayData.filename) {
        const match = this.assayData.filename.match(/-(\d+)_/);
        if (match) {
            assayId = match[1];
        }
    }

    this.assayForm.patchValue({
        assayType,
        measurementType,
        omics,
        assayId
    }, { emitEvent: false }); // Avoid triggering extra dynamic section updates

    // Parse Design Descriptors
    const descriptors = getValue('Assay Descriptor');
    const accessions = getValue('Assay Descriptor Term Accession Number');
    const refs = getValue('Assay Descriptor Term Source REF');

    if (descriptors) {
        const descArray = descriptors.split(';');
        const accArray = accessions ? accessions.split(';') : [];
        const refArray = refs ? refs.split(';') : [];

        this.designDescriptors = descArray.map((name, i) => {
            const ontology = new Ontology();
            ontology.annotationValue = name;
            ontology.termAccession = accArray[i] || "";
            const ts = new OntologySourceReference();
            ts.name = refArray[i] || "";
            ontology.termSource = ts;
            return ontology;
        });
    }

    if (this.mode === 'edit') {
        const assayTypeControl = this.assayForm.get('assayType');
        assayTypeControl.disable();
        
        // Ensure Omics and Measurement Type are also enabled for editing if they were disabled
        this.assayForm.get('omics').enable();
        this.assayForm.get('measurementType').enable();
    }
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
            this.assaySetup = rules.assays?.assaySetup;
        }

        // 3. Header Templates & Control Lists (Dependencies for Dynamic Sections)
        this.assayHeaderTemplates = headerTemplates;
        this.controlLists = controlLists;

        // 4. Configuration & Defaults
        if (config && config.versions) {
            this.templateConfiguration = config;
            this.currentTemplateVersion = version || config.defaultTemplateVersion; 
            
             // Handle Study Category Label
             this.studyCategory = studyCategoryVal;
             if (config.studyCategories && studyCategoryVal) {
                 const categoryConfig = config.studyCategories[studyCategoryVal];
                 this.studyCategoryLabel = (categoryConfig && categoryConfig.label) ? categoryConfig.label : studyCategoryVal;
             } else {
                 this.studyCategoryLabel = studyCategoryVal;
             }

            const versionConfig = config.versions[this.currentTemplateVersion];
            if (versionConfig) {
                // Assay Types
                const assayTemplates = versionConfig.activeAssayFileTemplates || {};
                let assayKeys = [];
                
                // 1. Try to get keys from Mapping
                let keysFromMapping = false;
                if (this.studyCategory && this.mode === 'add' && versionConfig.assayFileTypeMappings) {
                    const mappings = versionConfig.assayFileTypeMappings;
                    // Case-insensitive lookup for category in mappings
                    const categoryLower = this.studyCategory.toLowerCase();
                    const mappingKey = Object.keys(mappings).find(k => k.toLowerCase() === categoryLower);
                    
                    if (mappingKey) {
                        assayKeys = mappings[mappingKey];
                        keysFromMapping = true;
                    }
                }
                
                if (!keysFromMapping) {
                    // 2. Fallback to all keys
                    if (Array.isArray(assayTemplates)) {
                        assayKeys = assayTemplates;
                    } else if (typeof assayTemplates === 'object') {
                        assayKeys = Object.keys(assayTemplates);
                    }
                }
                
                // Use assayTemplates itself as the configMap if it contains labels and order
                this.activeAssayFileTemplates = this.processOptions(assayKeys, assayTemplates);

                // 3. Fallback Filter by Study Category (Case-insensitive) - Only if Mapping WAS NOT used
                if (!keysFromMapping && this.studyCategory && this.mode === 'add') {
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

                // Set Default Assay Type (First item) - REMOVED AUTO-SELECT as requested
                // if (!this.assayForm.get('assayType').value && this.activeAssayFileTemplates.length > 0) {
                //     this.assayForm.patchValue({ assayType: this.activeAssayFileTemplates[0].value });
                // }

                 // Trigger update if assay type is already selected (e.g. default)
                  const currentAssayType = this.assayForm.get('assayType').value;
                  if (currentAssayType) {
                      this.updateDynamicSections(currentAssayType);
                  } else {
                      this.dynamicSections = [];
                  }

                  if (this.mode === 'edit' && this.assayData) {
                    this.populateFormFromComments();
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
              ontologyTerm: details?.ontologyTerm || null, // Capture ontology
              order: details?.order || 0
          };
      }).sort((a, b) => a.order - b.order);
  }

  onAssayTypeChange(value) {
      this.updateDynamicSections(value);
  }

  updateDynamicSections(assayType: string) {
      
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

                   const isRequired = colDef.required === true || 
                                      colDef.required === 'true' || 
                                      colDef.required === '1' || 
                                      colDef.required === 1 ||
                                      (typeof colDef.required === 'string' && colDef.required.toLowerCase() === 'yes');
                   let fieldType = 'TEXT';
                   if (colDef.columnStructure === 'ONTOLOGY_COLUMN') fieldType = 'ONTOLOGY';
                   if (colDef.columnStructure === 'SINGLE_COLUMN_AND_UNIT_ONTOLOGY') fieldType = 'TEXT_AND_ONTOLOGY';

                   const strippedColName = colDef.columnHeader.replace(/Parameter Value\[/i, '').replace(/\]/gi, '')
                       .replace(/Characteristic\[/i, '').replace(/\]/gi, '')
                       .replace(/Factor Value\[/i, '').replace(/\]/gi, '').trim();

                   // Dynamically add or update form controls
                   const controlName = colDef.columnHeader;
                   touchedControls.add(controlName);
                   
                   const currentControl = this.assayForm.get(controlName);
                   // Skip validators in Edit mode as fields are hidden
                   const validators = (this.mode === 'edit') ? null : (isRequired ? Validators.required : null);
                   
                   if (!currentControl) {
                        this.assayForm.addControl(controlName, this.fb.control(colDef.defaultValue || '', validators));
                   } else {
                        currentControl.setValidators(validators);
                        currentControl.updateValueAndValidity();
                   }

                   if (fieldType === 'TEXT_AND_ONTOLOGY') {
                        const unitKey = controlName + '_unit';
                        touchedControls.add(unitKey);
                        if (!this.assayForm.contains(unitKey)) {
                            this.assayForm.addControl(unitKey, this.fb.control(''));
                        }
                   }

                   // Resolve Description and Validation Object
                   let description = colDef.description;
                   let validationObj: any = {
                       description: description,
                       'is-required': isRequired ? 'true' : 'false'
                   };

                   if (this.validations) {
                        const validationEntry = this.getValidationDefinition(colDef.columnHeader, assayType);
                        if (validationEntry) {
                           description = validationEntry['ontology-details']?.description || validationEntry.description || description;
                           if (validationEntry['ontology-details']) {
                               validationObj = validationEntry['ontology-details'];
                           } else {
                               validationObj.description = description;
                           }
                       }
                   }

                   // START: ValidationObj Cleanup
                   // Ensure description is set in the object if not present
                   if (!validationObj.description) validationObj.description = description;
                   // Ensure is-required is set (defaulting to colDef if not in ontology-details)
                   if (!validationObj['is-required']) validationObj['is-required'] = isRequired ? 'true' : 'false';
                   // END: ValidationObj Cleanup

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

                           // Robust Fallback: If no rule found with strict selection criteria,
                           // check if ANY rule exists for this field name in the control list.
                           if (!mainRule) {
                               for (const name of namesToTry) {
                                   const allRules = this.controlLists.controls.assayFileControls?.[name];
                                   if (allRules && allRules.length > 0) {
                                       mainRule = allRules[0]; // Take first available rule
                                       break;
                                   }
                               }
                           }
                       } catch(e) {}
                   }

                   let renderAsDropdown = false;
                   if (mainRule) {
                       renderAsDropdown = mainRule.validationType === 'selected-ontology-term' && mainRule.termEnforcementLevel === 'required';
                   }

                   let mainType = fieldType === 'TEXT_AND_ONTOLOGY' ? 'TEXT' : (fieldType === 'ONTOLOGY' ? 'ONTOLOGY' : 'TEXT');
                   if (fieldType === 'ONTOLOGY' || fieldType === 'TEXT_AND_ONTOLOGY' || colDef.columnStructure === 'SINGLE_COLUMN') {
                        const isOntologyType = mainRule && ['selected-ontology-term', 'ontology-term-in-selected-ontologies', 'child-ontology-term', 'any-ontology-term'].includes(mainRule.validationType);
                        if (isOntologyType) {
                            mainType = 'ONTOLOGY';
                            fieldType = 'ONTOLOGY'; // Ensure it renders using the ontology template
                        }
                   }

                   let unitRule = null;
                   if (fieldType === 'TEXT_AND_ONTOLOGY' && this.controlLists && this.controlLists.controls) {
                        const selectionInput: ValidationRuleSelectionInput = {
                            studyCategory: this.studyCategory as any,
                            studyCreatedAt: this.studyCreatedAt,
                            isaFileType: "assay" as any,
                            isaFileTemplateName: assayType ? assayType.split(';')[0] : null,
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
                       unitRule: unitRule,
                       validation: validationObj
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
        //   console.log("Selected Measurement Ontology:", selectedOption.ontology);
      }
  }

  onOmicsTypeChange(selectedOption: any) {
      if (selectedOption && selectedOption.ontology) {
        //   console.log("Selected Omics Ontology:", selectedOption.ontology);
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

  getValidationDefinition(header: string, technique: string) {
    if (!header) return null;

    let selectedColumn = null;
    let techniqueSpecificColumn = null;

    const currentTechnique = technique;
    const techniquePrefix = currentTechnique 
      ? (currentTechnique.replace(/-/g, "_").toUpperCase() + "_") 
      : "";

    // Prepare target headers (current header, stripped header, inner Parameter Value)
    const formattedColumnName = header.replace(/\.[0-9]+$/, "");
    let innerName = formattedColumnName;
    const match = formattedColumnName.match(/\[(.*?)\]/);
    if (match) {
        innerName = match[1];
    }
    // Comparison set: original, formatted, inner (all lowercased)
    const targetHeaders = [header, formattedColumnName, innerName].map(h => h ? h.toLowerCase() : "");

    // Iterate through validations
    if (this.validations && this.validations.assays && this.validations.assays.default_order) {
      this.validations.assays.default_order.forEach((col) => {
        const entryHeader = (col.header || "").toLowerCase();
        const entryColDef = (col.columnDef || "").toUpperCase();

        // 1. Check if this entry matches our column header
        const isHeaderMatch = targetHeaders.includes(entryHeader);
        
        // 2. Check if this entry is intended for our specific technique
        const isTechniqueMatch = techniquePrefix && entryColDef.startsWith(techniquePrefix);
        
        // 3. Fallback: check if columnDef matches our header (sometimes used in validations.json)
        const isColDefMatch = targetHeaders.includes((col.columnDef || "").toLowerCase());

        if (isHeaderMatch || isColDefMatch) {
          // If we already have a technique-specific match, don't overwrite it with a generic one
          if (techniqueSpecificColumn) return;

          // If this validation entry has specific technique names listed
          if (
            currentTechnique &&
            col["techniqueNames"] &&
            col["techniqueNames"].length > 0
          ) {
             if (col["techniqueNames"].indexOf(currentTechnique) > -1) {
                // Strict technique match found in list
                techniqueSpecificColumn = col;
             }
          } else if (isTechniqueMatch) {
             // Implicit technique match via columnDef prefix
             techniqueSpecificColumn = col;
          } else {
             // Generic match
             selectedColumn = col;
          }
        }
      });
    }

    return techniqueSpecificColumn ? techniqueSpecificColumn : selectedColumn;
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

    if (this.mode === 'edit') {
        this.saveEditAssay(formattedDescriptors);
        return;
    }

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

    const formValues = this.assayForm.getRawValue();
    const payload = {
      selectedAssayFileTemplate: formValues.assayType,
      assayIdentifier: null,
      assayResultFileType: "maf",
      assayResultFileName: null,
      selectedMeasurementType: formValues.measurementType || '', 
      selectedOmicsType: formValues.omics || '',
      designDescriptors: formattedDescriptors,
      assayFileDefaultValues: assayFileDefaultValues
    };

    
    this.editorService.addAssay(this.requestedStudy, payload).subscribe(
        (response) => {
          this.isAddAssayModalOpen = false;
          Swal.fire({
            title: "Assay added!",
            text: "Your assay has been successfully created.",
            type: "success",
            confirmButtonColor: "#10c1e5",
          });
          // Refresh both Assay List and Protocols
          this.store.dispatch(new AssayList.Get(this.requestedStudy));
          this.store.dispatch(new Protocols.Get());
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

  saveEditAssay(formattedDescriptors: any[]) {
      const formValues = this.assayForm.getRawValue();
      
      const getExistingComment = (name: string) => {
          if (this.assayData && this.assayData.comments) {
              const comment = this.assayData.comments.find(c => c.name === name);
              return comment ? comment.value : "";
          }
          return "";
      };

      // Filter Assay Types based on study category mappings
      let validAssayTypes = this.activeAssayFileTemplates;
      if (this.templateConfiguration && this.currentTemplateVersion) {
            const versionConfig = this.templateConfiguration.versions[this.currentTemplateVersion];
            if (versionConfig && versionConfig.assayFileTypeMappings) {
                 const mappings = versionConfig.assayFileTypeMappings;
                 const categoryLower = this.studyCategory ? this.studyCategory.toLowerCase() : "";
                 const mappingKey = Object.keys(mappings).find(k => k.toLowerCase() === categoryLower);
                 
                 const mappedTypes = mappingKey ? mappings[mappingKey] : [];
                 
                 if (mappedTypes.length > 0) {
                     validAssayTypes = this.activeAssayFileTemplates.filter(a => mappedTypes.includes(a.value));
                 }
            }
      }

      const assayOption = validAssayTypes.find(a => a.value === formValues.assayType);
      const assayLabel = assayOption ? (assayOption.ontologyTerm?.term || assayOption.label) : formValues.assayType;
      
      // Use existing technologyType if available (Assay Type corresponds to technologyType in model)
      const existingTechType = this.assayData?.technologyType;
      const assayTermSource = assayOption?.ontologyTerm?.termSource?.name || existingTechType?.termSource?.name || getExistingComment("Assay Type Term Source REF");
      const assayTermAccession = assayOption?.ontologyTerm?.termAccession || existingTechType?.termAccession || getExistingComment("Assay Type Term Accession Number");

      const measurementKey = formValues.measurementType;
      const measurementOption = this.activeMeasurementTypes.find(m => m.value === measurementKey);
      const measurementLabel = measurementOption ? measurementOption.label : measurementKey;
      
      // Check if user changed the value. If same as existing typed object, prefer existing metadata
      const existingMeasurementObj = this.assayData?.measurementType;
      const isMeasurementChanged = measurementKey !== existingMeasurementObj?.annotationValue && measurementLabel !== existingMeasurementObj?.annotationValue;

      const measurementTermSource = measurementOption?.ontologyTerm?.termSourceReference || measurementOption?.termSource?.name 
                                    || (!isMeasurementChanged ? existingMeasurementObj?.termSource?.name : "")
                                    || (!isMeasurementChanged ? getExistingComment("Measurement Type Term Source REF") : "");

      const measurementTermAccession = measurementOption?.ontologyTerm?.termAccession || measurementOption?.termAccession 
                                       || (!isMeasurementChanged ? existingMeasurementObj?.termAccession : "")
                                       || (!isMeasurementChanged ? getExistingComment("Measurement Type Term Accession Number") : "");


      const omicsKey = formValues.omics;
      const omicsOption = this.activeOmicsTypes.find(o => o.value === omicsKey);
      const omicsLabel = omicsOption ? omicsOption.label : omicsKey;

      const existingOmics = getExistingComment("Omics Type");
      const isOmicsChanged = omicsKey !== existingOmics && omicsLabel !== existingOmics;

      const omicsTermSource = omicsOption?.ontologyTerm?.termSourceReference || omicsOption?.termSource?.name 
                              || (!isOmicsChanged ? getExistingComment("Omics Type Term Source REF") : "");
      const omicsTermAccession = omicsOption?.ontologyTerm?.termAccession || omicsOption?.termAccession 
                                 || (!isOmicsChanged ? getExistingComment("Omics Type Term Accession Number") : "");

      const payload = {
          fields: {
              measurementType: measurementKey // User requested valid inputs are keys
          },
          comments: [
              { name: "Assay Type", value: assayLabel }, 
              { name: "Assay Type Label", value: formValues.assayType }, 
              { name: "Assay Type Term Source REF", value: assayTermSource },
              { name: "Assay Type Term Accession Number", value: assayTermAccession },
              { name: "Measurement Type", value: measurementLabel }, // Label for comment endpoint
              { name: "Measurement Type Term Source REF", value: measurementTermSource },
              { name: "Measurement Type Term Accession Number", value: measurementTermAccession },
              { name: "Omics Type", value: omicsLabel },
              { name: "Omics Type Term Source REF", value: omicsTermSource },
              { name: "Omics Type Term Accession Number", value: omicsTermAccession },
              { name: "Assay Descriptor", value: this.designDescriptors.map(d => d.annotationValue).join(';') },
              { name: "Assay Descriptor Term Accession Number", value: this.designDescriptors.map(d => d.termAccession).join(';') },
              { name: "Assay Descriptor Term Source REF", value: this.designDescriptors.map(d => d.termSource?.name).join(';') },
              { name: "Assay Descriptor Category", value: this.designDescriptors.map(d => d.comments.find(c => c.name === "Assay Descriptor Category")?.value || "").join(';') },
              { name: "Assay Descriptor Source", value: this.designDescriptors.map(d => d.comments.find(c => c.name === "Assay Descriptor Source")?.value || "submitter").join(';') }
          ]
      };

      this.editorService.updateAssayComments(this.requestedStudy, this.assayData.filename, payload).subscribe(
          (response) => {
              this.isAddAssayModalOpen = false;
              Swal.fire({
                  title: "Assay updated!",
                  text: "Your assay has been successfully updated.",
                  type: "success",
                  confirmButtonColor: "#10c1e5",
              });
              // Refresh both Assay List and Protocols
              this.store.dispatch(new AssayList.Get(this.requestedStudy));
              this.store.dispatch(new Protocols.Get());
          },
          (error) => {
              console.error('API Error:', error);
              Swal.fire({
                  title: "Error updating assay",
                  text: error.message || "An unexpected error occurred while updating the assay.",
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

  trackByField(index: number, field: any) {
    return field.key;
  }

  trackBySection(index: number, section: any) {
    return section.header;
  }
}

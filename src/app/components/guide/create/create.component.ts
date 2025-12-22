import { Component, model, OnInit, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { DatasetLicenseNS } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { getValidationRuleForField, MetabolightsFieldControls } from 'src/app/models/mtbl/mtbls/control-list';
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { StudyCreation } from "src/app/ngxs-store/non-study/study-creation/study-creation.actions";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.css"],
})
export class CreateComponent implements OnInit {
  requestedStudy: string = null;
  title$: Observable<string> = inject(Store).select(GeneralMetadataState.title);
  description$: Observable<string> = inject(Store).select(GeneralMetadataState.description);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  templateConfiguration$: Observable<any> = inject(Store).select(ApplicationState.templateConfiguration);
  sampleFileHeaderTemplates$: Observable<any> = inject(Store).select(ApplicationState.sampleFileHeaderTemplates);
  controlLists$: Observable<any> = inject(Store).select(ApplicationState.controlLists);

  studyTitle: string = "";
  studyDescription: string = "";
  validations: any = {};
  templateConfiguration: any = null;
  sampleFileHeaderTemplates: any = null;

  // Study Creation Data
  activeCategories: any[] = [];
  selectedCategories: string[] = [];
  assayFileTypeMappings: any = {};
  studyAssaySelection: any = {};
  isAnyAssaySelected = false;

  sampleFileTemplates: string[] = [];
  selectedSampleFileTemplate: string = '';

  dynamicHeaders: string[] = [];
  
  agreements: any = {
    datasetLicenseAgreement: true,
    datasetPolicyAgreement: true,
    emailCommunicationAgreement: true,
    privacyPolicyAgreement: true
  };

  // Ontology Fields
  submitterRole: Ontology[] = []; 
  publicationStatus: Ontology[] = [];
  publicationDoi: string = "";
  fundingFunder: Ontology[] = [];
  fundingGrant: string = "";
  funderOrganization: string = "";
  funderId: string = "";
  filteredFunderOrganizations$: Observable<any>;
  relatedDatasets: { identifier: string; url: string }[] = [{identifier: '', url: ''}];

  submitterRoleControlList: any = null;
  publicationStatusControlList: any = null;
  funderControlList: any = null;

  studyCreationForm: UntypedFormGroup;

  selectedCreateOption = 2;
  currentSubStep = 0;
  newStudy = "MTBLS1";
  options: any[] = [
    {
      text: "Yes, I would like to upload files now",
      value: 1,
      disabled: false,
    },
    {
      text: "I will upload files later",
      value: 2,
      disabled: false,
    },
  ];
  isLoading = false;
  baseHref: string;
  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private router: Router,
    private store: Store,
    private platformLocation: PlatformLocation
  ) {
    this.createForm();
    this.editorService.initialiseStudy(null);
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
    this.setUpSubscriptionsNgxs();
  }

  createForm() {
    this.studyCreationForm = this.fb.group({
      sampleFileTemplate: ['', Validators.required],
      submitterRole: [[]],
      publicationStatus: [[]],
      fundingFunder: [[]], // Keep legacy for now or remove if unused later
      funderOrganization: [''],
      funderId: [''],
      grantIdentifier: [''],
    });
  }

  private legacyControlLists: any = null;

  setUpSubscriptionsNgxs() {
    this.title$.subscribe(v => this.studyTitle = v);
    this.description$.subscribe(v => this.studyDescription = v);

    this.editorValidationRules$.subscribe((value) => {
      if (value) {
        this.validations = value;
      }
    });

    // Debounced autocomplete logic for Funder Organization
    this.filteredFunderOrganizations$ = this.studyCreationForm.get('funderOrganization')!.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (!query || query.length < 3) {
          return of([]);
        }
        return this.editorService.getRorOrganizations(query).pipe(
          switchMap((res: any) => {
            const docs = res?.response?.docs || [];
            const items = docs.map((doc: any) => ({
                id: doc.iri,
                name: doc.label || '(Unknown name)',
                synonyms: doc.synonym || [],
                description: doc.description?.[0] || '',
                ontology_prefix: doc.ontology_prefix
            }));
            return of(items);
          })
        );
      })
    );
    
    // Subscribe to sampleFileHeaderTemplates BEFORE templateConfiguration
    // to ensure it's available when initConfiguration calls loadDynamicHeaders
    this.sampleFileHeaderTemplates$.subscribe(templates => {
        if(templates) {
            this.sampleFileHeaderTemplates = templates;
            // If we already have a selected template, reload the headers
            if (this.selectedSampleFileTemplate) {
                this.loadDynamicHeaders(this.selectedSampleFileTemplate);
            }
        }
    });

    this.templateConfiguration$.subscribe(config => {
        if(config) {
            this.templateConfiguration = config;
            this.initConfiguration();
        }
    });

    this.controlLists$.subscribe(lists => {
        if (lists) {
            this.legacyControlLists = lists;
            this.submitterRoleControlList = this.getProcessedControlList("Study Person Roles");
            this.publicationStatusControlList = this.getProcessedControlList("Study Publication Status");
            this.funderControlList = this.getProcessedControlList("Funder Organization");
        }
    });
  }

  getProcessedControlList(listName: string) {
    const defaultList = { name: listName, values: [] };
    if (this.editorService.defaultControlLists && listName in this.editorService.defaultControlLists) {
      defaultList.values = this.editorService.defaultControlLists[listName].OntologyTerm || [];
    }

    let defaultOntologies = {};
    if (
        this.legacyControlLists &&
        this.legacyControlLists.controls &&
        this.legacyControlLists.controls["investigationFileControls"] &&
        this.legacyControlLists.controls["investigationFileControls"].__default__
    ) {
        defaultOntologies = this.legacyControlLists.controls["investigationFileControls"].__default__[0];
    }

    const selectionInput = {
      studyCategory: null,
      studyCreatedAt: null,
      isaFileType: "investigation" as any,
      isaFileTemplateName: null,
      templateVersion: this.templateConfiguration?.defaultTemplateVersion,
    };

    let rule = null;
    try {
      if (this.legacyControlLists) {
          rule = getValidationRuleForField(
              { controlLists: this.legacyControlLists } as MetabolightsFieldControls,
              listName,
              selectionInput
          );
      }
    } catch (e) { rule = null; }

    let renderAsDropdown = false;
    if (rule) {
        if (rule.validationType === "selected-ontology-term" && rule.termEnforcementLevel === "required") {
            renderAsDropdown = true;
            if (Array.isArray(rule.terms) && rule.terms.length > 0) {
                defaultList.values = rule.terms.map((t: any) => {
                    const o = new Ontology();
                    o.annotationValue = t.term || t.label || "";
                    o.termAccession = t.termAccessionNumber || t.termAccession || "";
                    o.termSource = { name: t.termSourceRef || "" } as any;
                    return o;
                });
            }
        }
    }

    return { ...defaultList, rule, renderAsDropdown, defaultOntologies };
  }

  fieldValidation(fieldPath: string) {
    if (!this.validations) return {};
    const parts = fieldPath.split('.');
    let slice = this.validations;
    for (const part of parts) {
      if (slice && slice[part]) {
        slice = slice[part];
      } else {
        return {};
      }
    }
    return slice;
  }

  initConfiguration() {
      if (!this.templateConfiguration) return;
      const defaultVersion = this.templateConfiguration.defaultTemplateVersion;
      if (!defaultVersion) return;
      
      const versionConfig = this.templateConfiguration.versions[defaultVersion];
      if (!versionConfig) return;

      const activeCategoryIds = versionConfig.activeStudyCategories || [];
      const studyCategoriesMetadata = this.templateConfiguration.studyCategories || {};
      this.assayFileTypeMappings = versionConfig.assayFileTypeMappings || {};

      this.activeCategories = activeCategoryIds.map(id => {
          return {
              id: id,
              label: studyCategoriesMetadata[id]?.label || id,
              assayTypes: this.assayFileTypeMappings[id] || []
          };
      });

      this.sampleFileTemplates = versionConfig.activeSampleFileTemplates || [];
      
      const defaultSampleTemplate = versionConfig.defaultSampleFileTemplate;
      if (defaultSampleTemplate) {
          this.selectedSampleFileTemplate = defaultSampleTemplate;
          this.studyCreationForm.controls['sampleFileTemplate']?.setValue(defaultSampleTemplate);
          this.onSampleTemplateChange(defaultSampleTemplate);
      }
  }

  onSampleTemplateChange(templateName: string) {
      this.selectedSampleFileTemplate = templateName;
      this.loadDynamicHeaders(templateName);
  }

  loadDynamicHeaders(templateName: string) {
      if (!this.sampleFileHeaderTemplates) return;
      
      // Access headers from: sampleFileHeaderTemplates[templateName][0].headers
      const templateData = this.sampleFileHeaderTemplates[templateName];
      const allHeaders = Array.isArray(templateData) && templateData.length > 0 
        ? templateData[0]?.headers || [] 
        : [];
      
      this.dynamicHeaders = allHeaders
        .filter((header: any) => {
          // If header is a string, check if it starts with 'Characteristics['
          if (typeof header === 'string') {
            return header.startsWith('Characteristics[');
          }
          
          // If header is an object, check columnCategory and required flag
          if (typeof header === 'object' && header !== null) {
            const columnCategory = header.columnCategory;
            const isRequired = header.required === true;
            return columnCategory === 'Characteristics' && isRequired;
          }
          
          return false;
        })
        .map((header: any) => {
          if (typeof header === 'string') {
            return header;
          }
          return header.header || header.columnHeader || header.name || null;
        })
        .filter((headerName: string | null) => headerName != null && headerName !== ''); // Remove any null/undefined/empty values
      
      console.log('Dynamic Headers:', this.dynamicHeaders);
      
      // Only add form controls if the form has been initialized
      if (this.studyCreationForm) {
        this.dynamicHeaders.forEach(header => {
           if (!this.studyCreationForm.contains(header)) {
               this.studyCreationForm.addControl(header, this.fb.control(null));
           }
        });
      }
  }
  
  toggleCategory(category: string, event: any) {
      if (event.target.checked) {
          this.selectedCategories.push(category);
          this.studyAssaySelection[category] = [];
      } else {
          this.selectedCategories = this.selectedCategories.filter(c => c !== category);
          delete this.studyAssaySelection[category];
      }
  }
  
  toggleAssay(category: string, assayType: string, event: any) {
       if (!this.studyAssaySelection[category]) this.studyAssaySelection[category] = [];
       if (event.target.checked) {
           this.studyAssaySelection[category].push(assayType);
       } else {
           this.studyAssaySelection[category] = this.studyAssaySelection[category].filter(a => a !== assayType);
       }
       this.updateSelectionStatus();
  }

  updateSelectionStatus() {
      this.isAnyAssaySelected = Object.values(this.studyAssaySelection).some((assays: string[]) => assays.length > 0);
  }

  onOntologySelect(controlName: string, event: any) {
    let values = [];
    if (Array.isArray(event)) {
      values = event;
    } else if (event && typeof event === 'object' && 'annotationValue' in event) {
      values = [event];
    } else if (typeof event === 'string') {
      const list = this.getControlListForField(controlName);
      if (list && list.values) {
        const selected = list.values.find(v => v.annotationValue === event);
        if (selected) values = [selected];
        else {
          const ont = new Ontology();
          ont.annotationValue = event;
          values = [ont];
        }
      }
    }

    if (this.hasOwnProperty(controlName)) {
      (this as any)[controlName] = values;
    }
    this.studyCreationForm.controls[controlName]?.setValue(values);
  }

  getControlListForField(fieldName: string) {
    if (fieldName === 'submitterRole') return this.submitterRoleControlList;
    if (fieldName === 'publicationStatus') return this.publicationStatusControlList;
    if (fieldName === 'fundingFunder') return this.funderControlList;
    return null;
  }

  onFunderSelected(event: MatAutocompleteSelectedEvent): void {
    const org = event.option.value as { name: string; id: string };
    if (org) {
      this.studyCreationForm.patchValue({
        funderOrganization: org.name,
        funderId: org.id
      });
    }
  }

  displayFunderName(org?: any): string {
    return org ? (typeof org === 'string' ? org : org.name) : "";
  }

  getFunderRorIdUrl(): string {
    const org = this.studyCreationForm.get("funderOrganization")?.value?.trim();
    return org ? `https://ror.org/search?query=${encodeURIComponent(org)}` : 'https://ror.org/';
  }

  addRelatedDataset() {
      this.relatedDatasets.push({identifier: '', url: ''});
  }
  removeRelatedDataset(index: number) {
      this.relatedDatasets.splice(index, 1);
  }

  ngOnInit() {
    this.store.dispatch(new Loading.Disable())
    
  }

  nextSubStep() {
    this.currentSubStep = this.currentSubStep + 1;
  }

  createStudy() {
    this.isLoading = true;
    this.editorService.createStudy().subscribe({
      next: (res) => {
        this.store.dispatch(new DatasetLicenseNS.ConfirmAgreement(res.new_study));
        this.currentSubStep = 3;
        this.newStudy = res.new_study;
        this.isLoading = false;
      },
      error: (err) => {
        toastr.error("Study creation error.", "Error", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: true,
        });
        this.isLoading = false;
      }
    });
  }

  proceedToNextStep() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      if (this.selectedCreateOption === 1) {
        this.router.navigate(["/guide/upload", this.newStudy]);
      } else {
        this.router.navigate(["/guide/meta", this.newStudy]);
      }
    }, 3000);
  }
}

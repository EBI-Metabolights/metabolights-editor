import { Component, OnInit, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { DatasetLicenseNS, GetGeneralMetadata } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { getValidationRuleForField, MetabolightsFieldControls } from 'src/app/models/mtbl/mtbls/control-list';
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { StudyCreation } from "src/app/ngxs-store/non-study/study-creation/study-creation.actions";
import { StudyCreationState } from "src/app/ngxs-store/non-study/study-creation/study-creation.state";
import { Operations } from "src/app/ngxs-store/study/files/files.actions";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
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
  user$: Observable<Owner> = inject(Store).select(UserState.user);
  currentUser: Owner = null;
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
  selectedSubmitterRole: Ontology = null;
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
  
  // Wizard Data (Step 2)
  factors: any[] = [];
  designDescriptors: any[] = [];
  contacts: any[] = [];
  descriptorControlLists: any = {};
  
  studyCreationForm: UntypedFormGroup;
  selectedCreateOption = 2;
  currentSubStep = 1;
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
    this.user$.subscribe(user => this.currentUser = user);
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
    // Validations - Study Creation State
    this.store.select(StudyCreationState.factors).subscribe(factors => this.factors = factors);
    this.store.select(StudyCreationState.designDescriptors).subscribe(descriptors => this.designDescriptors = descriptors);
    this.store.select(StudyCreationState.contacts).subscribe(contacts => this.contacts = contacts);
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
    this.store.dispatch(new Loading.Disable());
    this.store.dispatch(new StudyCreation.Reset());
  }
  nextSubStep() {
    this.currentSubStep = this.currentSubStep + 1;
  }
  
  // Validation Getters
  get isTitleValid(): boolean {
      return this.studyTitle && this.studyTitle.trim().length >= 10;
  }
  
  get isDescriptionValid(): boolean {
      return this.studyDescription && this.studyDescription.trim().length >= 10;
  }
  
  get isStep1Valid(): boolean {
    return !!(this.selectedSubmitterRole && 
           this.publicationStatus && this.publicationStatus.length > 0 &&
           this.agreements?.datasetLicenseAgreement &&
           this.agreements?.datasetPolicyAgreement &&
           this.agreements?.emailCommunicationAgreement);
  }
  get isStep2Valid(): boolean {
      return this.isTitleValid && 
             this.isDescriptionValid && 
             this.factors.length > 0 &&
             this.contacts.length > 0;
  }
  canProceedToNextStep(): boolean {
      if (this.currentSubStep === 1) {
          return this.isStep1Valid;
      }
      if (this.currentSubStep === 2) {
          return this.isStep2Valid;
      }
      return true;
  }
  createStudy() {
    // Check if Single or Multiple Category
    // We filter based on studyAssaySelection keys that have at least one selected item.
    // The keys represent the broad category (e.g. 'ms-mhd-legacy', 'nmr').
    const selectedCategoryKeys = Object.keys(this.studyAssaySelection).filter(key => 
        this.studyAssaySelection[key] && this.studyAssaySelection[key].length > 0
    );
    const distinctCategoriesType = new Set(selectedCategoryKeys); // e.g. 'ms', 'nmr' are keys in studyAssaySelection? 
    // Wait, studyAssaySelection keys ARE the category identifiers e.g. 'ms-mhd-legacy', 'nmr'.
    
    if (selectedCategoryKeys.length === 1) {
        // Single Category -> Go to Wizard Step 2
        this.currentSubStep = 2;
        this.setUpWizardStep(selectedCategoryKeys[0]);
        return;
    }
    // Multiple Category -> Immediate Creation
    this.submitStudy(true); 
  }
  // Agreements and Wizard Configuration
  descriptorControlListKey: string = null;
  setUpWizardStep(category: string) {
      // Initialize Contacts if empty
      if (this.contacts.length === 0) {
          this.initializePrimaryContact();
      }
      
      this.descriptorControlListKey = this.templateConfiguration?.descriptorConfiguration?.defaultDescriptorCategories?.[category]?.controlListKey || null;
  }
  initializePrimaryContact() {
      // Create primary contact from Current User + Submitter Role
      let role = null;
      if (this.submitterRole && this.submitterRole.length > 0) {
          role = this.submitterRole[0];
      }
      
      const newContact = {
          firstName: this.currentUser?.firstName || '',
          lastName: this.currentUser?.lastName || '',
          email: this.currentUser?.email || '',
          affiliation: this.currentUser?.affiliation || '',
          address: this.currentUser?.address || '',
          orcid: this.currentUser?.orcid || '',
          roles: role ? [role] : [],
          comments: []
      };
      this.store.dispatch(new StudyCreation.AddContact(newContact));
  }
  
  // --- Reused Component Helper Methods ---
  // Factors
  addFactorCompat(factor: any) {
      this.store.dispatch(new StudyCreation.AddFactor(factor));
  }
  
  updateFactor(factor: any, index: number) {
      this.store.dispatch(new StudyCreation.UpdateFactor(factor, index));
  }
  removeFactorCompat(factor: any, index: number) {
      this.store.dispatch(new StudyCreation.RemoveFactor(index));
  }
  // Descriptors
  addDescriptorCompat(descriptor: any) {
      this.store.dispatch(new StudyCreation.AddDesignDescriptor(descriptor));
  }
  
  updateDescriptor(descriptor: any, index: number) {
      this.store.dispatch(new StudyCreation.UpdateDesignDescriptor(descriptor, index));
  }
  removeDescriptorCompat(descriptor: any, index: number) {
      this.store.dispatch(new StudyCreation.RemoveDesignDescriptor(index));
  }
  // Contacts
  addContactCompat(contact: any) {
      this.store.dispatch(new StudyCreation.AddContact(contact));
  }
  
  updateContact(contact: any, index: number) {
      this.store.dispatch(new StudyCreation.UpdateContact(contact, index));
  }
  
  removeContactCompat(contact: any, index: number) {
      this.store.dispatch(new StudyCreation.RemoveContact(index));
  }
  onRoleChange(value) {
      if (value) {
          // mtbls-ontology emits an array of values
          const selectedValue = Array.isArray(value) ? value[0] : value;
          if (!selectedValue) return;
          this.selectedSubmitterRole = selectedValue;
          this.submitterRoleControlList.values.forEach(role => {
              if (role.annotationValue === selectedValue.annotationValue) {
                  this.selectedSubmitterRole = role;
              }
          });
      }
  }
  onPublicationStatusChange(value) {
      if (value) {
          // mtbls-ontology emits an array of values
          const selectedValue = Array.isArray(value) ? value[0] : value;
          if (!selectedValue) return;
          this.publicationStatus = [selectedValue]; 
          this.publicationStatusControlList.values.forEach(status => {
              if (status.annotationValue === selectedValue.annotationValue) {
                  this.publicationStatus = [status];
              }
          });
      }
  }
  submitStudy(isMultipleCategories: boolean = false) {
    this.isLoading = true;
    
    // Construct the payload
    const formValue = this.studyCreationForm.value;
    
    // Filter studyAssaySelection to only include selected categories
    const selectedStudyCategories: any = {};
    const selectedCategoryKeys = Object.keys(this.studyAssaySelection).filter(key => 
        this.selectedCategories.includes(key) && this.studyAssaySelection[key] && this.studyAssaySelection[key].length > 0
    );
    
    selectedCategoryKeys.forEach(key => {
        selectedStudyCategories[key] = this.studyAssaySelection[key];
    });
    // Get Publication Status (first selected value)
    let publicationStatus = null;
    if (this.publicationStatus && this.publicationStatus.length > 0) {
        // Ensure structure matches requirements
        const status = this.publicationStatus[0];
        publicationStatus = {
            comments: status.comments || [],
            annotationValue: status.annotationValue,
            termSource: status.termSource || { comments: [], name: 'EFO', file: '', version: '', description: '' },
            termAccession: status.termAccession
        };
    }
    // Get Funding
    const funding = [];
    const funderOrgName = formValue.funderOrganization;
    if (funderOrgName) {
        funding.push({
            fundingOrganization: {
                comments: [],
                annotationValue: funderOrgName,
                termSource: {
                    comments: [],
                    name: "ROR",
                    file: "",
                    version: "",
                    description: ""
                },
                termAccession: formValue.funderId || ""
            },
            grantIdentifier: formValue.grantIdentifier || ""
        });
    }
    // Contacts
    let contacts = [];
    if (isMultipleCategories) {
        // Use dummy for multiple
        contacts = [
            {
                comments: [
                    { name: "Study Person ORCID", value: "0000-0001-8604-1732" },
                    { name: "Study Person Affiliation ROR ID", value: "https://ror.org/02catss52" },
                    { name: "Study Person Alternative Email", value: "ozgur.yurekten@gmail.com" }
                ],
                firstName: "Ozgur",
                lastName: "Yurekten",
                email: "ozgur.yurekten@gmail.com",
                affiliation: "European Bioinformatics Institute",
                address: "EMBL-EBI",
                fax: "",
                midInitials: "",
                phone: "",
                contactIndex: 0,
                roles: [
                    {
                        comments: [],
                        termAccession: "http://purl.obolibrary.org/obo/NCIT_C19924",
                        annotationValue: "Principal Investigator",
                        termSource: {
                            comments: [],
                            description: "National Cancer Institute Thesaurus",
                            file: "http://purl.obolibrary.org/obo/ncit.owl",
                            name: "NCIT",
                            version: ""
                        }
                    }
                ]
            }
        ];
    } else {
        // Use Wizard Contacts (Step 2)
        // Transform internal contact structure to payload structure if needed
        contacts = this.contacts.map((c, index) => ({
             comments: [
                { name: "Study Person ORCID", value: c.orcid || "" },
             ],
             firstName: c.firstName,
             lastName: c.lastName,
             email: c.email,
             affiliation: c.affiliation,
             address: c.address || "",
             fax: "",
             midInitials: "",
             phone: "",
             contactIndex: index,
             roles: c.roles || []
        }));
    }
    // Factors (Mapped from Wizard Step 2 if single, else dummy)
    let factors = [];
    if (isMultipleCategories) {
        factors = [
            {
                comments: [],
                factorName: "Disease",
                factorType: {
                    comments: [],
                    termAccession: "http://www.ebi.ac.uk/efo/EFO_0000408",
                    annotationValue: "disease",
                    termSource: { comments: [], description: "", file: "", name: "EFO", version: "" }
                }
            }
        ];
    } else {
        factors = this.factors.map(f => ({
            comments: [],
            factorName: f.factorName,
            factorType: {
                 comments: [],
                 termAccession: f.factorType?.termAccession || '',
                 annotationValue: f.factorType?.annotationValue || '',
                 termSource: f.factorType?.termSource || { comments: [], description: "", file: "", name: "EFO", version: "" }
            }
        }));
    }
    // Design Descriptors (Mapped from Wizard Step 2 if single, else dummy)
    let designDescriptors = [];
    if (isMultipleCategories) {
        designDescriptors = [
             {
                comments: [{ name: "Study Design Type Category", value: "disease" }, { name: "Study Design Type Source", value: "submitter" }],
                annotationValue: "cancer",
                termSource: { comments: [], name: "MONDO", file: "", version: "", description: "" },
                termAccession: "http://purl.obolibrary.org/obo/MONDO_0004992"
            }
        ];
    } else {
        designDescriptors = this.designDescriptors.map(d => ({
            comments: [], // Need to handle category/source mapping?
            annotationValue: d.annotationValue || '',
            termAccession: d.termAccession || '',
            termSource: d.termSource || { comments: [], name: '', file: '', version: '', description: '' }
        }));
    }
    const payload = {
        selectedTemplateVersion: this.templateConfiguration?.defaultTemplateVersion || "1.0",
        selectedStudyCategories: selectedStudyCategories,
        selectedInvestigationFileTemplate: "minimum", 
        selectedSampleFileTemplate: formValue.sampleFileTemplate || "minimum",
        datasetLicenseAgreement: this.agreements.datasetLicenseAgreement,
        datasetPolicyAgreement: this.agreements.datasetPolicyAgreement,
        emailCommunicationAgreement: this.agreements.emailCommunicationAgreement,
        privacyPolicyAgreement: this.agreements.privacyPolicyAgreement,
        publicationStatus: publicationStatus,
        title: this.studyTitle,
        description: this.studyDescription,
        relatedDatasets: this.relatedDatasets,
        funding: funding,
        contacts: contacts,
        publicationDoi: (this as any).publicationDoi || "", 
        designDescriptors: designDescriptors,
        factors: factors
    };
    console.log('Creating study with payload:', payload);
    this.editorService.createStudy(payload).subscribe({
      next: (res) => {
        if (isMultipleCategories) {
             toastr.success("We created the following MetaboLights submissions for your study. You can select and update your MetaboLights submissions.", "Success", {
                timeOut: "5000",
                positionClass: "toast-top-center",
                preventDuplicates: true,
                extendedTimeOut: 0,
                tapToDismiss: true,
            });
            this.store.dispatch(new DatasetLicenseNS.ConfirmAgreement(res.new_study));
            this.newStudy = res.new_study;
            this.isLoading = false;
            this.router.navigate(["/guide/meta", this.newStudy]);
        } else {
            // Standard flow success -> Go to Step 1 (Upload) or Finish? 
            // In original flow `currentSubStep = 3` seemed to be next.
            // But if we have Step 2 as metadata, maybe Step 3 is upload?
            this.store.dispatch(new DatasetLicenseNS.ConfirmAgreement(res.new_study));
            this.currentSubStep = 1; // Or wherever Upload is?
            // Wait, existing Upload is currentSubStep == 1. 
            // So if we just finished Step 2 (Metadata), we go to Step 3?
            // No, user requirement implies the Metadata is a new intermediate step.
            // Let's assume on success of metadata we go to the "Created" state or Upload.
            // Given "redirect to created study page with a popup showing below details", 
            // maybe we just redirect for Single too?
            // "if it is single categrory study selection ... then it should go to next page ... and then we need to create request json"
            // So after creation, we probably redirect?
            this.store.dispatch(new DatasetLicenseNS.ConfirmAgreement(res.new_study));
            this.newStudy = res.new_study;
            this.isLoading = false;
            
            // Load the new study data into the store for Step 3 and 4 components
            this.store.dispatch(new GetGeneralMetadata(this.newStudy, false));
            this.store.dispatch(new Operations.GetFreshFilesList(false, false, this.newStudy));
            this.currentSubStep = 3;
        }
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
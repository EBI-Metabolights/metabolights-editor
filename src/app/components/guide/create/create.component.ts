import { Component, OnInit, inject, ViewChild } from "@angular/core";
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
import { MTBLSComment } from "src/app/models/mtbl/mtbls/common/mtbls-comment";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { PersonComponent } from "../../shared/people/person/person.component";
import Swal from "sweetalert2";
@Component({
  selector: "app-create",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.css"],
})
export class CreateComponent implements OnInit {
  @ViewChild('personEditor') personEditor: PersonComponent;
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
  investigationFileTemplates: string[] = [];
  selectedSampleFileTemplate: string = '';
  selectedInvestigationFileTemplate: string = '';

  licenseUrl: string = "";
  licenseName: string = "";
  
  showConfirmationModal = false;
  confirmationTitle = "Confirmation";
  confirmationMessage = "";

  
  agreements: any = {
    datasetLicenseAgreement: false,
    datasetPolicyAgreement: false,
    emailCommunicationAgreement: false,
    privacyPolicyAgreement: true
  };
  // Ontology Fields
  selectedSubmitterRole: Ontology = null;
  submitterRole: Ontology[] = []; 
  publicationStatus: Ontology[] = [];
  publicationDoi: string = "";
  funders: any[] = [];
  filteredFunderOrganizations$: Observable<any>;
  relatedDatasets: any[] = [];
  submitterRoleControlList: any = null;
  publicationStatusControlList: any = null;
  funderControlList: any = null;
  
  // Wizard Data (Step 2)
  factors: any[] = [];
  designDescriptors: any[] = [];
  activeDesignDescriptorCategories: any[] = [];
  contacts: any[] = [];
  editingContactIndex: number = -1;
  descriptorControlLists: any = {};
  
  studyCreationForm: UntypedFormGroup;
  selectedCreateOption = 2;
  currentSubStep = 1;
  newStudy = null;
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
      investigationFileTemplate: ['', Validators.required],
      submitterRole: [[]],
      publicationStatus: [[]],
      fundingFunder: [[]], // Keep legacy for now or remove if unused later
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

    
    // Subscribe to sampleFileHeaderTemplates BEFORE templateConfiguration
    // to ensure it's available when initConfiguration calls loadDynamicHeaders
    this.sampleFileHeaderTemplates$.subscribe(templates => {
        if(templates) {
            this.sampleFileHeaderTemplates = templates;
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
            if(this.templateConfiguration){
                this.initConfiguration();
            }
        }
    });
    // Validations - Study Creation State
    this.store.select(StudyCreationState.factors).subscribe(factors => this.factors = factors);
    this.store.select(StudyCreationState.designDescriptors).subscribe(descriptors => this.designDescriptors = descriptors);
    this.store.select(StudyCreationState.contacts).subscribe(contacts => this.contacts = contacts);
    this.store.select(StudyCreationState.funders).subscribe(funders => this.funders = funders);
    this.store.select(StudyCreationState.relatedDatasets).subscribe(ds => this.relatedDatasets = ds);
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
      studyCreatedAt: listName === 'Study Publication Status' ? new Date() : null,
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
      const activeCategoryIdsConfig = versionConfig.activeStudyCategories || [];
      const studyCategoriesMetadata = this.templateConfiguration.studyCategories || {};
      this.assayFileTypeMappings = versionConfig.assayFileTypeMappings || {};

      let sortedCategoryIds: string[] = [];
      if (Array.isArray(activeCategoryIdsConfig)) {
          sortedCategoryIds = activeCategoryIdsConfig;
      } else if (typeof activeCategoryIdsConfig === 'object') {
          // Handle new object structure: { 'id': { visible: boolean, order: number } }
          sortedCategoryIds = Object.keys(activeCategoryIdsConfig)
            .filter(key => activeCategoryIdsConfig[key].visible)
            .sort((a, b) => activeCategoryIdsConfig[a].order - activeCategoryIdsConfig[b].order);
      }

      this.activeCategories = sortedCategoryIds.map(id => {
          return {
              id: id,
              label: studyCategoriesMetadata[id]?.label || id,
              assayTypes: this.assayFileTypeMappings[id] || []
          };
      });
      this.sampleFileTemplates = versionConfig.activeSampleFileTemplates || [];
      this.investigationFileTemplates = versionConfig.activeInvestigationFileTemplates || [];
      
      const defaultSampleTemplate = versionConfig.defaultSampleFileTemplate;
      if (defaultSampleTemplate) {
          this.selectedSampleFileTemplate = defaultSampleTemplate;
          this.studyCreationForm.controls['sampleFileTemplate']?.setValue(defaultSampleTemplate);
          this.onSampleTemplateChange(defaultSampleTemplate);
      }

      const defaultInvestigationTemplate = versionConfig.defaultInvestigationFileTemplate 
        || (versionConfig.activeInvestigationFileTemplates && versionConfig.activeInvestigationFileTemplates.length > 0 ? versionConfig.activeInvestigationFileTemplates[0] : null)
        || 'minimum';
      
      console.log('Default Investigation Template:', defaultInvestigationTemplate);
      
      this.selectedInvestigationFileTemplate = defaultInvestigationTemplate;
      this.studyCreationForm.controls['investigationFileTemplate']?.setValue(defaultInvestigationTemplate);

      // License Information
      this.licenseName = versionConfig.defaultDatasetLicense || "";
      if (this.licenseName && this.templateConfiguration.datasetLicenses) {
          const licenseInfo = this.templateConfiguration.datasetLicenses[this.licenseName];
          if (licenseInfo) {
              this.licenseUrl = licenseInfo.url || "";
          }
      }

      // Design Descriptor Categories
      const activeDescriptorCategoryIdsConfig = versionConfig.activeStudyDesignDescriptorCategories || [];
      const descriptorMetadata = this.templateConfiguration.descriptorConfiguration?.defaultDescriptorCategories || {};
      
      let descriptorSource: any[] = [];
      if (Array.isArray(activeDescriptorCategoryIdsConfig)) {
          descriptorSource = activeDescriptorCategoryIdsConfig.map(id => ({ id, min: 0 })); 
      } else if (typeof activeDescriptorCategoryIdsConfig === 'object') {
          descriptorSource = Object.keys(activeDescriptorCategoryIdsConfig)
            .filter(key => activeDescriptorCategoryIdsConfig[key].visible)
            .sort((a, b) => activeDescriptorCategoryIdsConfig[a].order - activeDescriptorCategoryIdsConfig[b].order)
            .map(key => ({ id: key, min: activeDescriptorCategoryIdsConfig[key].min || 0 }));
      }

      this.activeDesignDescriptorCategories = descriptorSource.map(item => {
          const meta = descriptorMetadata[item.id];
          let controlListKey = meta?.controlListKey || null;
          const isaFileType = meta?.isaFileType || 'investigation';

          if (controlListKey && this.legacyControlLists) {
              const selectionInput = {
                  isaFileType: isaFileType,
                  studyCategory: null,
                  studyCreatedAt: new Date(),
                  templateVersion: this.templateConfiguration?.defaultTemplateVersion
              };
              let rule = null;
              try {
                  rule = getValidationRuleForField(
                    { controlLists: this.legacyControlLists } as MetabolightsFieldControls,
                    controlListKey,
                    selectionInput as any
                  );
              } catch(e) { rule = null; }
              
              if (!rule) {
                   controlListKey = "Study Design Type";
              }
          } else if (!controlListKey) {
              controlListKey = "Study Design Type";
          }


          return {
              id: item.id,
              label: meta?.label || item.id,
              controlListKey: controlListKey,
              min: item.min,
              isaFileType: isaFileType
          };
      });
  }

  get selectedStudyCategoryIds(): string[] {
      if (!this.studyAssaySelection) return [];
      return Object.keys(this.studyAssaySelection).filter(key => this.studyAssaySelection[key]);
  }

  onSampleTemplateChange(templateName: string) {
      this.selectedSampleFileTemplate = templateName;
  }
  
  onInvestigationTemplateChange(templateName: string) {
      this.selectedInvestigationFileTemplate = templateName;
  }

  
  toggleAssay(category: string, assayType: string, event: any) {
    if (!this.studyAssaySelection[category]) this.studyAssaySelection[category] = [];
    if (event.target.checked) {
      this.studyAssaySelection[category].push(assayType);
    } else {
      this.studyAssaySelection[category] = this.studyAssaySelection[category].filter(a => a !== assayType);
    }

    // Sync selectedCategories for consistency in submitStudy filter
    if (this.studyAssaySelection[category].length > 0) {
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
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

  ngOnInit() {
    this.store.dispatch(new Loading.Disable());
    this.store.dispatch(new StudyCreation.Reset());
  }
  nextSubStep() {
    this.currentSubStep = this.currentSubStep + 1;
  }
  
  // Validation Getters
  get isTitleValid(): boolean {
      return this.studyTitle && this.studyTitle.trim().length >= 25;
  }
  
  get isDescriptionValid(): boolean {
      return this.studyDescription && this.studyDescription.trim().length >= 60;
  }
  
  get isDoiRequired(): boolean {
    if (!this.publicationStatus || this.publicationStatus.length === 0) return false;
    const status = this.publicationStatus[0].annotationValue?.toLowerCase();
    return status === "published" || status === "preprint";
  }

  get isValidDoi(): boolean {
    const doi = this.publicationDoi ? this.publicationDoi.trim() : "";
    if (doi === "") return true;
    
    // Attempt to use pattern from server-side validations
    const validation = this.fieldValidation('publications.publication.doi');
    const patternRule = (validation?.rules || []).find(r => r.condition === 'pattern');
    if (patternRule) {
        const re = new RegExp(patternRule.value, 'i');
        return re.test(doi);
    }

    const doiRegex = /^10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/;
    return doiRegex.test(doi);
  }

  get doiErrorMessage(): string {
    const doiValue = this.publicationDoi ? this.publicationDoi.trim() : "";
    
    if (this.isDoiRequired && doiValue === "") {
        return ""; // User prefers no text message for requirement, just the highlight
    }
    
    if (doiValue !== "" && !this.isValidDoi) {
        const validation = this.fieldValidation('publications.publication.doi');
        const patternRule = (validation?.rules || []).find(r => r.condition === 'pattern');
        if (patternRule && patternRule.error) {
            return patternRule.error.replace('{input}', doiValue).replace('{field}', 'DOI');
        }
        return "Invalid DOI format (e.g. 10.xxxx/yyyy)";
    }
    return "";
  }

  get isStep1Valid(): boolean {
    return !!(this.isAnyAssaySelected &&
           this.selectedSubmitterRole && 
           this.publicationStatus && this.publicationStatus.length > 0 &&
           this.doiErrorMessage === "" &&
           this.selectedSampleFileTemplate &&
           this.selectedInvestigationFileTemplate &&
           this.agreements?.datasetLicenseAgreement &&
           this.agreements?.datasetPolicyAgreement);
  }
  get hasPrincipalInvestigator(): boolean {
      return this.contacts.some(c => 
          c.roles && c.roles.some(r => r.annotationValue === 'Principal Investigator')
      );
  }

  isContactValid(contact: any): boolean {
    return this.getContactErrors(contact).length === 0;
  }

  getContactErrors(contact: any): string[] {
    const errors: string[] = [];
    const isPI = contact.roles?.some(r => r.annotationValue === 'Principal Investigator');

    const orcid = contact.orcid || contact.comments?.find(c => c.name === "Study Person ORCID")?.value || "";
    const rorid = contact.rorid || contact.comments?.find(c => c.name === "Study Person Affiliation ROR ID")?.value || "";
    const email = contact.email || "";
    const affiliation = contact.affiliation || "";
    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";

    // Always Mandatory
    if (!firstName.trim()) errors.push("First name is required");
    if (!lastName.trim()) errors.push("Last name is required");
    if (!contact.roles || contact.roles.length === 0) errors.push("At least one role is required");

    // Mandatory for PI
    if (isPI) {
        if (!email.trim()) errors.push("Email is required");
        if (!affiliation.trim()) errors.push("Affiliation is required");
    }

    // Pattern/Min Length Validation (only if field has value)
    if (email.trim()) {
        const emailRe = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRe.test(email)) errors.push("Email format is invalid");
    }

    if (orcid.trim()) {
        const orcidRe = /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[X0-9]$/;
        if (!orcidRe.test(orcid)) errors.push("ORCID format is invalid");
    }

    if (rorid.trim()) {
        const rorRe = /^(https:\/\/ror\.org\/[0-9a-z]{9}|https:\/\/www\.wikidata\.org\/wiki\/Q[1-9][0-9]{0,19})$/;
        if (!rorRe.test(rorid)) errors.push("ROR ID format is invalid");
    }

    if (affiliation.trim() && affiliation.trim().length < 10) {
        errors.push("Affiliation must be at least 10 characters");
    }

    return errors;
  }

  get isStep2Valid(): boolean {
      const allContactsValid = this.contacts.length > 0 && this.contacts.every(c => this.isContactValid(c));
      return this.isTitleValid && 
             this.isDescriptionValid && 
             this.factors.length > 0 &&
             this.hasPrincipalInvestigator &&
             allContactsValid;
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
    
    // Always proceed to Step 2, regardless of number of categories selected
    this.currentSubStep = 2;
    // Use the first selected category for setup configuration, or null if none (though validation prevents 0)
    // If multiple categories are selected, we simply use the first one to determine the descriptor list.
    // This aligns with the requirement to treat multiple categories same as single.
    const primaryCategory = selectedCategoryKeys.length > 0 ? selectedCategoryKeys[0] : null;
    this.setUpWizardStep(primaryCategory);
  }

  triggerSubmit() {
    const selectedCategoryKeys = Object.keys(this.studyAssaySelection).filter(key => 
        this.studyAssaySelection[key] && this.studyAssaySelection[key].length > 0
    );
    const count = selectedCategoryKeys.length;
    
    this.confirmationTitle = "Confirm Submission";
    if (count > 0) {
        this.confirmationMessage = `We created the following ${count} MetaboLights submissions for your study. Are you sure to continue?`;
    } else {
        this.confirmationMessage = "Are you sure you would like to create this study?";
    }
    this.showConfirmationModal = true;
  }

  onConfirmSelection(confirmed: boolean) {
    this.showConfirmationModal = false;
    if (confirmed) {
        if (this.contacts.length === 0) {
            this.initializePrimaryContact();
        }
        
        const selectedCategoryKeys = Object.keys(this.studyAssaySelection).filter(key => 
            this.studyAssaySelection[key] && this.studyAssaySelection[key].length > 0
        );
        const isMultiple = selectedCategoryKeys.length > 1;

        this.submitStudy(isMultiple); 
    }
  }

  // Agreements and Wizard Configuration
  descriptorControlListKey: string = null;
  setUpWizardStep(category: string) {
      // Initialize Contacts if empty
      if (this.contacts.length === 0) {
          this.initializePrimaryContact();
      } else {
          this.updatePrimaryContactFromRole();
      }
      
      this.descriptorControlListKey = this.templateConfiguration?.descriptorConfiguration?.defaultDescriptorCategories?.[category]?.controlListKey || null;
  }

  updatePrimaryContactFromRole() {
      if (this.contacts.length > 0 && this.selectedSubmitterRole) {
          // Find the contact that matches the current user's email
          // This assumes the first contact or the one matching the email is the "primary"
          const index = this.contacts.findIndex(c => c.email === (this.currentUser?.email || ''));
          if (index > -1) {
              const contact = { ...this.contacts[index] };
              // Only update if the role is actually different to avoid redundant store dispatches
              const currentRole = contact.roles?.[0]?.annotationValue;
              if (currentRole !== this.selectedSubmitterRole.annotationValue) {
                  contact.roles = [this.selectedSubmitterRole];
                  this.store.dispatch(new StudyCreation.UpdateContact(contact, index));
              }
          }
      }
  }

  initializePrimaryContact() {
      // Create primary contact from Current User + Submitter Role
      let role = null;
      if (this.selectedSubmitterRole) {
          role = this.selectedSubmitterRole;
      }
      
      const newContact = {
          firstName: this.currentUser?.firstName || '',
          lastName: this.currentUser?.lastName || '',
          email: this.currentUser?.email || '',
          affiliation: this.currentUser?.affiliation || '',
          address: '',
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
  addDescriptorWithCategory(descriptor: any, categoryId: string) {
      if (!descriptor.comments) descriptor.comments = [];
      descriptor.comments.push(new MTBLSComment("Study Design Type Category", categoryId));
      descriptor.comments.push(new MTBLSComment("Study Design Type Source", "submitter"));
      this.store.dispatch(new StudyCreation.AddDesignDescriptor(descriptor));
  }

  addKeyword(descriptor: any) {
      if (!descriptor.comments) descriptor.comments = [];
      // Ensure comments are empty for keywords
      descriptor.comments = [];
      this.store.dispatch(new StudyCreation.AddDesignDescriptor(descriptor));
  }
  
  getDescriptorsByCategory(categoryId: string) {
      return this.designDescriptors.filter(d => 
          d.comments && d.comments.some(c => c.name === "Study Design Type Category" && c.value === categoryId)
      );
  }

  getKeywords() {
      return this.designDescriptors.filter(d => 
          !d.comments || !d.comments.some(c => c.name === "Study Design Type Category")
      );
  }

  removeDescriptorCompat(descriptor: any) {
      const index = this.designDescriptors.indexOf(descriptor);
      if (index > -1) {
          this.store.dispatch(new StudyCreation.RemoveDesignDescriptor(index));
      }
  }
  // Contacts
  addNewContact() {
      this.editingContactIndex = -1;
      if (this.personEditor) {
          this.personEditor.person = null;
          this.personEditor.addNewPerson = true;
          this.personEditor.openModal();
      }
  }

  editContact(contact: any, index: number) {
      this.editingContactIndex = index;
      if (this.personEditor) {
          this.personEditor.person = contact;
          this.personEditor.addNewPerson = false;
          this.personEditor.openModal();
      }
  }

  saveContactCompat(contact: any) {
      if (this.editingContactIndex > -1) {
          this.store.dispatch(new StudyCreation.UpdateContact(contact, this.editingContactIndex));
          this.editingContactIndex = -1;
      } else {
          this.store.dispatch(new StudyCreation.AddContact(contact));
      }
  }
  
  updateContact(contact: any, index: number) {
      this.store.dispatch(new StudyCreation.UpdateContact(contact, index));
  }
  
  removeContactCompat(contact: any, index: number) {
      this.store.dispatch(new StudyCreation.RemoveContact(index));
  }
  onRoleChange(value) {
      if (value) {
          const selectedValue = Array.isArray(value) ? value[0] : value;
          if (!selectedValue) return;

          let matchedRole = null;
          if (typeof selectedValue === 'string') {
              if (this.submitterRoleControlList && this.submitterRoleControlList.values) {
                  matchedRole = this.submitterRoleControlList.values.find(role => role.annotationValue === selectedValue);
              }
          } else {
              matchedRole = selectedValue;
          }

          if (matchedRole) {
              this.selectedSubmitterRole = matchedRole;
              this.submitterRole = [matchedRole];
          }
      }
  }
  onPublicationStatusChange(value) {
      if (value) {
          const selectedValue = Array.isArray(value) ? value[0] : value;
          if (!selectedValue) return;

          let matchedStatus = null;
          if (typeof selectedValue === 'string') {
              if (this.publicationStatusControlList && this.publicationStatusControlList.values) {
                  matchedStatus = this.publicationStatusControlList.values.find(status => status.annotationValue === selectedValue);
              }
          } else {
              matchedStatus = selectedValue;
          }

          if (matchedStatus) {
              this.publicationStatus = [matchedStatus];
          }
      }
  }
  submitStudy(isMultipleCategories: boolean = false) {
    this.isLoading = true;
    
    // Construct the payload
    const formValue = this.studyCreationForm.value;
    
    // Construct selectedStudyCategories from studyAssaySelection
    const selectedStudyCategories: any = {};
    Object.keys(this.studyAssaySelection).forEach(key => {
        if (this.studyAssaySelection[key] && this.studyAssaySelection[key].length > 0) {
            selectedStudyCategories[key] = this.studyAssaySelection[key];
        }
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
    const funding = this.funders.map(f => ({
        fundingOrganization: f.fundingOrganization,
        grantIdentifier: f.grantIdentifier
    }));
    // Contacts
    let contacts = [];
    // Unified mapping for both single and multiple category flows
    contacts = this.contacts.map((c, index) => {
        const comments = [];
        
        // Handle metadata from various potential formats (c.orcid vs c.comments subset)
        const orcid = c.orcid || c.comments?.find(com => com.name === "Study Person ORCID")?.value;
        const rorid = c.rorid || c.comments?.find(com => com.name === "Study Person Affiliation ROR ID")?.value;
        const altEmail = c.alternativeEmail || c.comments?.find(com => com.name === "Study Person Alternative Email")?.value;

        if (orcid) comments.push({ name: "Study Person ORCID", value: orcid });
        if (rorid) comments.push({ name: "Study Person Affiliation ROR ID", value: rorid });
        if (altEmail) comments.push({ name: "Study Person Alternative Email", value: altEmail });

        return {
             comments: comments,
             firstName: c.firstName,
             lastName: c.lastName,
             email: c.email,
             affiliation: c.affiliation,
             address: c.address || "",
             fax: c.fax || "",
             midInitials: c.midInitials || "",
             phone: c.phone || "",
             contactIndex: index,
             roles: c.roles || []
        };
    });
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
            comments: f.comments || [],
            factorName: f.factorName,
            factorType: {
                 comments: f.factorType?.comments || [],
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
            comments: d.comments || [], 
            annotationValue: d.annotationValue || '',
            termAccession: d.termAccession || '',
            termSource: d.termSource || { comments: [], name: '', file: '', version: '', description: '' }
        }));
    }
    const payload = {
        selectedTemplateVersion: this.templateConfiguration?.defaultTemplateVersion || "1.0",
        selectedStudyCategories: selectedStudyCategories,
        selectedInvestigationFileTemplate: this.selectedInvestigationFileTemplate || "minimum",
        selectedSampleFileTemplate: formValue.sampleFileTemplate || "minimum",
        datasetLicenseAgreement: this.agreements.datasetLicenseAgreement,
        datasetPolicyAgreement: this.agreements.datasetPolicyAgreement,
        publicationStatus: publicationStatus,
        title: this.studyTitle,
        description: this.studyDescription,
        relatedDatasets: this.relatedDatasets,
        funding: funding,
        contacts: contacts,
        publicationDoi: (this as any).publicationDoi || "", 
        designDescriptors: designDescriptors,
        factors: factors,

    };

    console.log('Creating study with payload:', JSON.stringify(payload, null, 2));
    this.editorService.createStudy(payload).subscribe({
      next: (res) => {
        // Dispatch common actions
        this.store.dispatch(new DatasetLicenseNS.ConfirmAgreement(res.new_study));
        this.newStudy = res.new_study;
        this.isLoading = false;

        if (isMultipleCategories) {
            const count = Object.keys(selectedStudyCategories).length;
            Swal.fire({
              title: "Success",
              text: `We created the following ${count} MetaboLights submissions for your study. You can select and update your MetaboLights submissions.`,
              type: "success",
              confirmButtonText: "OK"
            }).then(() => {
              this.router.navigate(['/console']);
            });
        } else {
            // Single Category Flow: Proceed to wizard Step 3
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
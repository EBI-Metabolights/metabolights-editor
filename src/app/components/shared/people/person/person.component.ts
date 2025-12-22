import { EditorService } from "../../../../services/editor.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  inject,
} from "@angular/core";
import { Ontology } from "../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPerson } from "../../../../models/mtbl/mtbls/mtbls-person";
import { trigger, style, animate, transition } from "@angular/animations";
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./person.validator";
import * as toastr from "toastr";
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { JsonConvert } from "json2typescript";
import { OntologyComponent } from "../../ontology/ontology.component";
import { Observable, of, Subscription } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import {Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { People } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { MTBLSComment } from "src/app/models/mtbl/mtbls/common/mtbls-comment";
import { AppMessage, GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { getValidationRuleForField, MetabolightsFieldControls, StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";


@Component({
  selector: "mtbls-person",
  templateUrl: "./person.component.html",
  styleUrls: ["./person.component.css"],
  animations: [
    trigger("enterAnimation", [
      transition(":enter", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate("500ms", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [
        style({ transform: "translateX(0)", opacity: 1 }),
        animate("500ms", style({ transform: "translateX(100%)", opacity: 0 })),
      ]),
    ]),
  ],
})
export class PersonComponent implements OnInit {
  @Input("value") person: MTBLSPerson;

  @ViewChild(OntologyComponent) rolesComponent: OntologyComponent;
  
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);
  
  studyCreatedAt$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCreatedAt
  );
  studyCategory$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCategory
  );
  templateVersion$: Observable<string> = inject(Store).select(
    GeneralMetadataState.templateVersion
  );

  isReadOnly = false;
  validations: any = {};
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Person Roles";
  requestedStudy: string = null;

  form: UntypedFormGroup;
  showAdvanced = false;
  isFormBusy = false;

  isApproveSubmitterModalOpen = false;

  isModalOpen = false;
  addNewPerson = false;
  isTimeLineModalOpen = false;
  initialEmail = "";
  isDeleteModalOpen = false;
  roleError = false;

  options: string[] = ["One", "Two", "Three"];
  private legacyControlLists: Record<string, any[]> | null = null;
  validationsId = "people.person";
  showError = false;

  
  private toastrSettings: Record<string, any> = {};
  isPiRole: boolean= false;
  filteredOrganizations$: Observable<any[]> = of([]);
  private subscription: Subscription;  // For unsubscribing
  message: AppMessage | null = null;
  showOntology: boolean = true;
  studyCategory: any;
  templateVersion: any;
  studyCreatedAt: any;
  _controlList: any = null;
  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private generalMetadataService: GeneralMetadataService,
    private store: Store
  ) {
    this.store.select(ApplicationState.controlLists).subscribe((lists) => {
        this.legacyControlLists = lists || {};
    });
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((value) => {this.toastrSettings = value})
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        if (value) {
          this.isReadOnly = value;
        } else {
          this.isReadOnly = false;
        }
      }
    });
   
    this.studyIdentifier$.pipe(filter(value => value !== null)).subscribe((value) => {
            this.requestedStudy = value;
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
  }

  ngOnInit() {
    if (this.person == null) {
      this.addNewPerson = true;
    }
    this.subscription = this.generalMetadataService.messageSubject.subscribe((appMessage: AppMessage) => {
      this.message = appMessage;  
      if (appMessage.status === 'success') {
        this.refreshContacts(appMessage.message);
        this.closeModal();
        this.isDeleteModalOpen = false;
        this.isApproveSubmitterModalOpen = false;
      }
    });
    this._controlList = this.controlList();
    
  }
  
  onEmptyError(isEmpty: boolean) {
    this.showError = isEmpty;
  }

  private getCommentValue(label: string): string {
    return (
      this.person?.comments?.find((c) => c.name === label)?.value || ""
    );
  }
  onAffiliationSelected(event: MatAutocompleteSelectedEvent): void {
    const org = event.option.value as { name: string; id: string };
    if (org) {
      this.form.patchValue({
        affiliation: org.name,
        rorid: org.id
      });
    }
  }

  initialiseForm() {
    this.isFormBusy = false;

    if (this.person == null) {
      const mtblsPerson = new MTBLSPerson();
      this.person = mtblsPerson;
    }
    

    this.form = this.fb.group({
      lastName: [
        this.person.lastName,
        ValidateRules("lastName", this.fieldValidation("lastName")),
      ],
      firstName: [
        this.person.firstName,
        ValidateRules("firstName", this.fieldValidation("firstName")),
      ],
      midInitials: [
        this.person.midInitials,
        ValidateRules("midInitials", this.fieldValidation("midInitials")),
      ],
      email: [
        this.person.email,
        ValidateRules("email", this.fieldValidation("email")), // RFC 5322 Official Standard 
      ],
      alternativeEmail: [
        this.getCommentValue("Study Person Alternative Email"),
        ValidateRules("alternativeEmail", this.fieldValidation("alternativeEmail")), // RFC 5322 Official Standard 
      ],
      address: [
        this.person.address,
        ValidateRules("address", this.fieldValidation("address")),
      ],
      affiliation: [
        this.person.affiliation,
        ValidateRules("affiliation", this.fieldValidation("affiliation")),
      ],
      rorid: [
        this.getCommentValue("Study Person Affiliation ROR ID"),
        ValidateRules("rorid", this.fieldValidation("rorid")),
      ],
      comment: [],
      roles: [
        this.person.roles,
        ValidateRules("roles", this.fieldValidation("roles")),
      ],
      orcid: [
        this.getCommentValue("Study Person ORCID"),
        ValidateRules("orcid", this.fieldValidation("orcid")),
      ],
    });

    // Debounced autocomplete logic
    this.filteredOrganizations$ = this.form.get('affiliation')!.valueChanges.pipe(
    debounceTime(600),
    distinctUntilChanged(),
    switchMap((query: string) => {
      if (!query || query.length < 3) {
        return of([]);
      }

      return this.editorService.getRorOrganizations(query).pipe(
        switchMap((res: any) => {
          const docs = res?.response?.docs || [];

          const items = docs.map((doc: any) => {
            return {
              id: doc.iri,
              name: doc.label || '(Unknown name)',
              synonyms: doc.synonym || [],
              description: doc.description?.[0] || '',
              ontology_prefix: doc.ontology_prefix
            };
          });

          return of(items);
        })
      );
    })
  );
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
    // ensure controlList is computed before initialising form so roles control has correct shape
    try {
      this._controlList = this.controlList();
    } catch (e) {
      this._controlList = null;
    }

    this.initialiseForm();

    // ensure roles control / ontology child are initialised with the current value
    try {
      const rolesControl = this.form?.get("roles");
      if (rolesControl) {
        if (this._controlList && this._controlList.renderAsDropdown) {
          // dropdown expects strings (annotationValue)
          const initStr = this.person?.roles?.[0]?.annotationValue || (Array.isArray(rolesControl.value) ? rolesControl.value[0] : rolesControl.value) || "";
          rolesControl.setValue(initStr, { emitEvent: false });
        } else {
          const initObj = this.person?.roles && this.person.roles.length ? this.person.roles : (Array.isArray(rolesControl.value) ? rolesControl.value : null);
          rolesControl.setValue(initObj, { emitEvent: false });
          if (this.rolesComponent && typeof (this.rolesComponent as any).setValues === "function") {
            try {
              const vals = Array.isArray(initObj) ? initObj : initObj ? [initObj] : [];
              (this.rolesComponent as any).setValues(vals);
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn("Failed to set roles control initial value", e);
    }

    this.isModalOpen = true;
    this.showOntology = true;
    this.updateValidatorsBasedOnRoles();
  }

  toogleShowAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  closeModal() {
    this.isModalOpen = false;
    if(this.person)
      this.showOntology = false;
  }

  confirmDelete() {
    this.isModalOpen = false;
    this.isDeleteModalOpen = true;
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
    this.isModalOpen = true;
  }

  deleteNgxs() {
    const identifier = this.person.email !== "" ? this.person.email : null;
    const name = this.person.email === "" ? `${this.person.firstName}${this.person.lastName}` : null;
    const contactIndex = this.person.contactIndex || 0;
    
    this.store.dispatch(new People.Delete(identifier, name, contactIndex)).subscribe({
      next: () => {
        // this.refreshContacts("Person deleted.");
        this.isDeleteModalOpen = false;
        this.isFormBusy = false;
      },
      error: () => {
        this.isFormBusy = false;
      },
    });
  }

  get validation() {
    if (this.validationsId.includes(".")) {
      const arr = this.validationsId.split(".");
      let tempValidations = JSON.parse(JSON.stringify(this.validations));
      while (arr.length && (tempValidations = tempValidations[arr.shift()])) {}
      return tempValidations;
    }
    return this.validations ? this.validations[this.validationsId] : {};
  }

  fieldValidation(fieldId) {
    return this.validation[fieldId];
  }
 isFieldRequired(fieldId: string): boolean {
  const fieldValidation = this.fieldValidation(fieldId);
  if (fieldValidation && fieldValidation["is-required"]) {
    const isRequired = JSON.parse(fieldValidation["is-required"]);
    return isRequired === true || isRequired === "true";
  }
  return false;
}

  approveGrantSubmitterRole() {
    this.isModalOpen = false;
    this.isApproveSubmitterModalOpen = true;
  }

  closeSubmitterAproval() {
    this.isModalOpen = true;
    this.isApproveSubmitterModalOpen = false;
  }

  grantSubmitter() {
    this.store.dispatch(new People.GrantSubmitter(this.person.email)).subscribe(
      (completed) => {
        toastr.success("Added user as a submitter", "Success", this.toastrSettings);
        this.isModalOpen = true;
        this.isApproveSubmitterModalOpen = false;
        },
        (error) => {
          this.isFormBusy = false;
        }
      )
  }

 saveNgxs() {
  if (this.isReadOnly) return;
  try {
    let rolesToSet: any[] = [];
    if (this.rolesComponent && Array.isArray((this.rolesComponent as any).values) && (this.rolesComponent as any).values.length > 0) {
      rolesToSet = (this.rolesComponent as any).values;
    } else {
      const ctrlVal = this.form?.get("roles")?.value;
      if (Array.isArray(ctrlVal)) rolesToSet = ctrlVal;
      else if (ctrlVal) rolesToSet = [ctrlVal];
    }
    if (this.form && this.form.get("roles")) {
      this.form.get("roles").setValue(rolesToSet, { emitEvent: false });
    }
  } catch (e) {
    // ignore sync errors
  }

  this.isFormBusy = true;
  const body = this.compileBody();

  if (!this.addNewPerson) {
    const { email, firstName, lastName, contactIndex } = this.person;
    const name = `${firstName}${lastName}`;
    const newEmail = this.getFieldValue("email");

    let updateAction: People.Update;

    if (contactIndex !== undefined && contactIndex !== null) {
      updateAction = new People.Update(body, null, null, contactIndex);
    } else if (newEmail !== email && email !== "") {
      updateAction = new People.Update(body, email, null);
    } else {
      updateAction = new People.Update(body, null, name);
    }

    this.store.dispatch(updateAction).subscribe({
        next: () => {
          this.isFormBusy = false;  // Success handling
        },
        error: () => {
          this.isFormBusy = false;  // Fallback
        },
      });

  } else {
    // Adding a new person
    this.store.dispatch(new People.Add(body)).subscribe({
      next: () => {
        // this.refreshContacts('Person Added.');
        this.isFormBusy = false;
      },
      error: () => {
        this.isFormBusy = false;
      },
    });
  }
}
ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();  // Unsubscribe to prevent memory leaks
    }
  }


  refreshContacts(message) {
    if (!this.isReadOnly) {
      // this.form.markAsPristine();
      toastr.success(message, "Success", this.toastrSettings);
    }
  }
private updateValidatorsBasedOnRoles() {
    if (!this.form) {
      console.error('Form is not initialized yet!');
      return;
    }

    const rolesValue = this.form.get('roles')?.value || this.person?.roles || [];
    // Dynamically detect PI role
    if (this._controlList?.renderAsDropdown) {
      this.isPiRole = rolesValue === 'Principal Investigator';
    }else{
      this.isPiRole = rolesValue.some((role: any) =>
        role.annotationValue?.includes('Principal Investigator')
      );
  }
    this.updatePiValidators(this.isPiRole);
  }

  onChanges(event?: any) {
    if (!this.form) return;

    const isDropdown = !!(this._controlList && this._controlList.renderAsDropdown);

    try {
      if (!isDropdown) {
        const newRoles =
          this.rolesComponent && Array.isArray((this.rolesComponent as any).values)
            ? (this.rolesComponent as any).values
            : [];
        const prevRoles = this.form.get('roles')?.value;
        if (JSON.stringify(prevRoles) !== JSON.stringify(newRoles)) {
          this.form.get('roles')?.setValue(newRoles);
        }
      } else {
        const selected = event?.value !== undefined ? event.value : this.form.get('roles')?.value;
        if (this.form.get('roles')?.value !== selected) {
          this.form.get('roles')?.setValue(selected);
        }
      }
    } catch (e) {
      // ignore sync errors
    }

    this.updateValidatorsBasedOnRoles();
  }

private updatePiValidators(isPi: boolean): void {
  const piFields = ['affiliation', 'email'];
  const alwaysRequiredFields = ['firstName', 'lastName'];

  // Helper to normalize validators to an array
  const getValidatorArray = (fieldControl: AbstractControl): any[] => {
    const raw = (fieldControl as any)._rawValidators;
    const validator = fieldControl.validator;
    if (Array.isArray(raw)) {
      return [...raw];
    }
    if (typeof raw === 'function') {
      return [raw];
    }
    if (typeof validator === 'function') {
      return [validator];
    }
    return [];
  };

  // Handle PI-specific fields
  piFields.forEach(fieldName => {
    const fieldControl = this.form.get(fieldName);
    if (!fieldControl) return;

    const existingValidators = getValidatorArray(fieldControl);
    const asyncValidators = fieldControl.asyncValidator ? [fieldControl.asyncValidator] : [];

    let updatedValidators: any[];

    if (isPi) {
      updatedValidators = [
        ...existingValidators.filter(v => v !== Validators.required),
        Validators.required
      ];
    } else {
      updatedValidators = existingValidators.filter(v => v !== Validators.required);
    }

    fieldControl.setValidators(updatedValidators);
    fieldControl.setAsyncValidators(asyncValidators);
    fieldControl.updateValueAndValidity({ emitEvent: false });
  });

  alwaysRequiredFields.forEach(fieldName => {
    const fieldControl = this.form.get(fieldName);
    if (!fieldControl) return;

    const existingValidators = getValidatorArray(fieldControl);
    const asyncValidators = fieldControl.asyncValidator ? [fieldControl.asyncValidator] : [];

    const updatedValidators = [
      ...existingValidators.filter(v => v !== Validators.required),
      Validators.required
    ];

    fieldControl.setValidators(updatedValidators);
    fieldControl.setAsyncValidators(asyncValidators);
    fieldControl.updateValueAndValidity({ emitEvent: false });
  });

  this.form.updateValueAndValidity({ emitEvent: false });
}



  getIsRequired(fieldName: string): boolean {
    return this.isPiRole; 
  }

  getObject(data) {
    return JSON.parse(data);
  }

  compileBody() {
    const jsonConvert: JsonConvert = new JsonConvert();
    const mtblPerson = new MTBLSPerson();
    mtblPerson.lastName = this.getFieldValue("lastName");
    mtblPerson.firstName = this.getFieldValue("firstName");
    mtblPerson.midInitials = this.getFieldValue("midInitials");
    mtblPerson.email = this.getFieldValue("email");
    // mtblPerson.phone = this.getFieldValue("phone");
    // mtblPerson.fax = this.getFieldValue("fax");
    mtblPerson.address = this.getFieldValue("address");
    mtblPerson.affiliation = this.getFieldValue("affiliation");
    const sourceRoles: any[] = (() => {
      try {
        if (this.rolesComponent && Array.isArray((this.rolesComponent as any).values) && (this.rolesComponent as any).values.length > 0) {
          return (this.rolesComponent as any).values;
        }
      } catch (_) {}
      const ctrlVal = this.form?.get("roles")?.value;
      if (!ctrlVal) return [];
      if (Array.isArray(ctrlVal)) return ctrlVal;
      return [ctrlVal];
    })();

    sourceRoles.forEach((role) => {
      let ont: Ontology | null = null;
      try {
        if (typeof role === "string") {
          ont = new Ontology();
          ont.annotationValue = role;
        } else {
          ont = jsonConvert.deserializeObject(role, Ontology);
        }
      } catch {
        ont = (role as Ontology) || null;
      }

      if (!ont) return;

      if (!ont.termSource) ont.termSource = new OntologySourceReference();
      if (!ont.termSource.name) ont.termSource.name = "";

      mtblPerson.roles.push(ont);
    });

    const comments: MTBLSComment[] = [];

    const orcid = this.getFieldValue("orcid")?.trim();
    const rorid = this.getFieldValue("rorid")?.trim();
    const altEmail = this.getFieldValue("alternativeEmail")?.trim();

    if (orcid) {
      comments.push(new MTBLSComment("Study Person ORCID", orcid));
    }
    if (rorid) {
      comments.push(new MTBLSComment("Study Person Affiliation ROR ID", rorid));
    }
    if (altEmail) {
      comments.push(new MTBLSComment("Study Person Alternative Email", altEmail));
    }

    mtblPerson.comments = comments;

    return { contacts: [mtblPerson.toJSON()] };
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }
  getRoridUrl(): string {
    const affiliation = this.getFieldValue("affiliation")?.trim();
    return affiliation ? `https://ror.org/search?query=${encodeURIComponent(affiliation)}` : 'https://ror.org/';
  }
  getOrcidUrl(): string {
    const lastName = this.getFieldValue("lastName")?.trim();
    const firstName = this.getFieldValue("firstName")?.trim();
    return lastName || firstName ? `https://orcid.org/orcid-search/search?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&otherFields=true` : 'https://orcid.org/';
  }

  private getRolesValue(): any | null {
    try {
      if (this.rolesComponent && Array.isArray((this.rolesComponent as any).values) && (this.rolesComponent as any).values.length > 0) {
        return (this.rolesComponent as any).values[0];
      }
    } catch (_) {}

    const controlVal = this.form?.get("roles")?.value;
    if (controlVal === null || controlVal === undefined) return null;
    if (Array.isArray(controlVal)) {
      return controlVal.length > 0 ? controlVal[0] : null;
    }
    return controlVal;
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
      if (rule.validationType === "selected-ontology-term" && rule.termEnforcementLevel === "required") {
        renderAsDropdown = true;
        if (Array.isArray(rule.terms) && rule.terms.length > 0) {
          const ontologiesValues = rule.terms.map((t: any) => {
            const o = new Ontology();
            o.annotationValue = t.term || t.label || "";
            o.termAccession = t.termAccessionNumber || t.termAccession || "";
            o.termSource = new OntologySourceReference();
            o.termSource.name = t.termSourceRef || (t.termSource && t.termSource.name) || "";
            o.termSource.file = t.provenance_uri || "";
            o.termSource.provenance_name = t.provenance_name || "";
            o.comments = [];
            return o;
          });
          this.defaultControlList.values = ontologiesValues;
        }
      }
    }

    // ensure values always present
    const valuesArray = Array.isArray(this.defaultControlList.values) ? this.defaultControlList.values : [];

    const result = {
      ...this.defaultControlList,
      values: valuesArray,
      rule,
      defaultOntologies,
      renderAsDropdown
    };
    this._controlList = result;
    return result;
  }
  
}


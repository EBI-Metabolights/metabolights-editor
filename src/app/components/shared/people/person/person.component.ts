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
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./person.validator";
import * as toastr from "toastr";
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
    standalone: false
})
export class PersonComponent implements OnInit {
  @Input("value") person: MTBLSPerson;

  @ViewChild(OntologyComponent) rolesComponent: OntologyComponent;
  
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);


  isReadOnly = false;
  validations: any = {};
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Person Role";
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

  validationsId = "people.person";

  private toastrSettings: Record<string, any> = {};
  isPiRole: boolean= false;
  filteredOrganizations$: Observable<any[]> = of([]);
  private subscription: Subscription;  // For unsubscribing
  message: AppMessage | null = null;
   
  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private generalMetadataService: GeneralMetadataService,
    private store: Store
  ) {
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
    this.studyIdentifier$.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
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
        this.isModalOpen = false;
        this.isDeleteModalOpen = false;
        this.isApproveSubmitterModalOpen = false;
      }
    });
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
      this.person.roles = [];
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
        ValidateRules("email", this.fieldValidation("email")), // RFC 5322 Official Standard (https://emailregex.com/)
      ],
      alternativeEmail: [
        this.getCommentValue("Study Person Alternative Email"),
        ValidateRules("alternativeEmail", this.fieldValidation("alternativeEmail")), // RFC 5322 Official Standard 
      ],
      // phone: [
      //   this.person.phone,
      //   ValidateRules("phone", this.fieldValidation("phone")),
      // ],
      // fax: [this.person.fax, ValidateRules("fax", this.fieldValidation("fax"))],
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
        this.person?.comments?.[0]?.value || "",
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
          const items =
            res.items?.map((item: any) => {
              const org = item.organization;
              const nameObj = org.names.find((n: any) => n.lang === 'en');
              const name =
                nameObj?.value || org.names[0]?.value || '(Unknown name)';
              const countryName =
                org.locations?.[0]?.geonames_details?.country_name || '(Unknown country)';
              return {
                id: org.id,
                name,
                countryName,
              };
            }) || [];

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
    this.initialiseForm();
    this.isModalOpen = true;
    this.updateValidatorsBasedOnRoles();
  }

  toogleShowAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  closeModal() {
    this.isModalOpen = false;
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
    return this.validations[this.validationsId];
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

    const rolesValue = this.person?.roles || this.form.get('roles')?.value || [];

    // Dynamically detect PI role
    this.isPiRole = rolesValue.some((role: any) =>
      role.annotationValue?.includes('Principal Investigator')
    );

    this.updatePiValidators(this.isPiRole);
  }

  onChanges() {
  this.form.controls.roles.setValue(this.rolesComponent.values);
  
  if (this.rolesComponent.values.length !== 0) {
    this.form.controls.roles.markAsDirty();
  }

  this.updateValidatorsBasedOnRoles();
}
private updatePiValidators(isPi: boolean): void {
    const piFields = ['orcid', 'affiliation', 'rorid', 'email'];

    piFields.forEach(fieldName => {
      const fieldControl = this.form.get(fieldName);
      if (!fieldControl) {
        console.warn(`Control for ${fieldName} does not exist in the form. Skipping.`);
        return;
      }

      const currentValidators = fieldControl.validator ? [fieldControl.validator] : [];
      let validatorFns = currentValidators.length ? (fieldControl as any)._rawValidators || currentValidators : [];

      // Ensure validatorFns is an array
      if (!Array.isArray(validatorFns)) {
        validatorFns = [];  
      }

      const asyncValidators = fieldControl.asyncValidator ? [fieldControl.asyncValidator] : [];

      let updatedValidators: any[] = validatorFns;  // Start with the array

      if (isPi) {
        if (!updatedValidators.includes(Validators.required)) {
          updatedValidators = [...updatedValidators, Validators.required];
        }
      } else {
        updatedValidators = updatedValidators.filter(v => v !== Validators.required);
      }

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
    this.rolesComponent.values.forEach((role) => {
      mtblPerson.roles.push(jsonConvert.deserializeObject(role, Ontology));
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
  controlList() {
    if (!(this.defaultControlList && this.defaultControlList.name.length > 0)
      && this.editorService.defaultControlLists && this.defaultControlListName in this.editorService.defaultControlLists){
      this.defaultControlList.values = this.editorService.defaultControlLists[this.defaultControlListName].OntologyTerm;
      this.defaultControlList.name = this.defaultControlListName;
    }
    return this.defaultControlList;
  }
  
}


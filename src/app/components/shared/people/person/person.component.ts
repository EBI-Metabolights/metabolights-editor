import { EditorService } from "../../../../services/editor.service";
import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MTBLSComment } from "../../../../models/mtbl/mtbls/common/mtbls-comment";
import { Ontology } from "../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPerson } from "../../../../models/mtbl/mtbls/mtbls-person";
import { trigger, style, animate, transition } from "@angular/animations";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./person.validator";
import { tassign } from "tassign";
import * as toastr from "toastr";

import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";

import { OntologyComponent } from "../../ontology/ontology.component";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select, Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { People } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

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

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(ApplicationState.toastrSettings) toastrSettings$: Observable<Record<string, any>>;


  isReadOnly = false;

  validations: any = {};
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Person Role";
  requestedStudy: string = null;

  form: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
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
        ValidateRules("email", this.fieldValidation("email")),
      ],
      phone: [
        this.person.phone,
        ValidateRules("phone", this.fieldValidation("phone")),
      ],
      fax: [this.person.fax, ValidateRules("fax", this.fieldValidation("fax"))],
      address: [
        this.person.address,
        ValidateRules("address", this.fieldValidation("address")),
      ],
      affiliation: [
        this.person.affiliation,
        ValidateRules("affiliation", this.fieldValidation("affiliation")),
      ],
      comment: [],
      roles: [
        this.person.roles,
        ValidateRules("roles", this.fieldValidation("roles")),
      ],
    });
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
    if (this.rolesComponent) {
      this.rolesComponent.setValues([]);
    }
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
    
    this.store.dispatch(new People.Delete(identifier, name)).subscribe(
      (response) => {
        this.refreshContacts("Person deleted.");
        this.isDeleteModalOpen = false;
        this.isModalOpen = false;
      },
      (error) => {
        this.isFormBusy = false;
      }
    );
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
    if (!this.isReadOnly) {
      this.isFormBusy = true;
      if (!this.addNewPerson) { // if we are updating an existing person
        const emailChanged = this.getFieldValue("email") !== this.person.email && this.person.email !== "";
        const updateIdentifier = emailChanged ? this.person.email : null;
        const updateName = !emailChanged ? `${this.person.firstName}${this.person.lastName}` : null;
        
        this.store.dispatch(new People.Update(this.compileBody(), updateIdentifier, updateName)).subscribe(
          (completed) => {
            this.refreshContacts("Person updated.");
          },
          (error) => {
            this.isFormBusy = false;
          }
        );
      } else { // if we are adding a new person
        this.store.dispatch(new People.Add(this.compileBody())).subscribe(
          (completed) => {
            this.refreshContacts("New person added.");
            this.closeModal();
          },
          (error) => {
            this.isFormBusy = false;
          }
        )
      }
    }
  }

  refreshContacts(message) {
    if (this.isReadOnly) {
      this.form.markAsPristine();
      toastr.success(message, "Success", this.toastrSettings);
    }
  }


  onChanges() {
    this.form.controls.roles.setValue(this.rolesComponent.values);
    if (this.rolesComponent.values.length !== 0) {
      this.form.controls.roles.markAsDirty();
    }
    this.form.markAsDirty();
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
    mtblPerson.phone = this.getFieldValue("phone");
    mtblPerson.fax = this.getFieldValue("fax");
    mtblPerson.address = this.getFieldValue("address");
    mtblPerson.affiliation = this.getFieldValue("affiliation");
    this.rolesComponent.values.forEach((role) => {
      mtblPerson.roles.push(jsonConvert.deserializeObject(role, Ontology));
    });
    return { contacts: [mtblPerson.toJSON()] };
  }

  getFieldValue(name) {
    return this.form.get(name).value;
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

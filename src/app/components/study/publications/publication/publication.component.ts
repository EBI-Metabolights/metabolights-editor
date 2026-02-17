import { EditorService } from "../../../../services/editor.service";
import { DOIService } from "../../../../services/publications/doi.service";
import { EuropePMCService } from "../../../../services/publications/europePMC.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from "@angular/core";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../../models/mtbl/mtbls/mtbls-publication";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { ValidateRules } from "./publication.validator";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import { JsonConvert } from "json2typescript";
import * as toastr from "toastr";
import { MTBLSPerson } from "./../../../../models/mtbl/mtbls/mtbls-person";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { People, Publications, StudyAbstract, Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { MTBLSComment } from "src/app/models/mtbl/mtbls/common/mtbls-comment";
import { getValidationRuleForField, MetabolightsFieldControls, StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";

@Component({
  selector: "mtbls-publication",
  templateUrl: "./publication.component.html",
  styleUrls: ["./publication.component.css"],
})
export class PublicationComponent implements OnInit {
  @Input("value") publication: any;

  @ViewChild(OntologyComponent) statusComponent: OntologyComponent;

  editorValidationRules$: Observable<Record<string, any>> = inject(
    Store
  ).select(ValidationState.studyRules);
  readonly$: Observable<boolean> = inject(Store).select(
    ApplicationState.readonly
  );
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(
    ApplicationState.toastrSettings
  );
  id$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  title$: Observable<string> = inject(Store).select(GeneralMetadataState.title);
  description$: Observable<string> = inject(Store).select(
    GeneralMetadataState.description
  );
  
  studyCreatedAt$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCreatedAt
  );
  studyCategory$: Observable<string> = inject(Store).select(
    GeneralMetadataState.studyCategory
  );
  templateVersion$: Observable<string> = inject(Store).select(
    GeneralMetadataState.templateVersion
  );
  private title: string = "";
  private description: string = "";
  private _controlList: any = null;

  toastrSettings: Record<string, any> = {};

  isReadOnly = true;

  form: UntypedFormGroup;
  isFormBusy = false;
  addNewPublication = false;

  validations: any;
  validationsId = "publications.publication";
  defaultControlList: { name: string; values: any[] } = {
    name: "",
    values: [],
  };
  defaultControlListName = "Study Publication Status";
  isModalOpen = false;
  isTimeLineModalOpen = false;
  isDeleteModalOpen = false;
  isUpdateTitleModalOpen = false;
  isUpdateAbstractModalOpen = false;
  isImportAuthorsModalOpen = false;
  showOntology: boolean = true;
  manuscriptAuthors: any = null;

  publicationAbstract = "";
  private legacyControlLists: Record<string, any[]> | null = null;
  studyCategory: any;
  templateVersion: any;
  studyCreatedAt: any;
  showError = false;

  constructor(
    private fb: UntypedFormBuilder,
    private doiService: DOIService,
    private europePMCService: EuropePMCService,
    private editorService: EditorService,
    private store: Store,
    private cdRef: ChangeDetectorRef
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = { name: "", values: [] };
    }
    this.store.select(ApplicationState.controlLists).subscribe((lists) => {
      this.legacyControlLists = lists || {};
    });
    this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((settings) => {
      this.toastrSettings = settings;
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
    this.title$.subscribe((value) => {});
    this.description$.subscribe((value) => {});
    
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

  openImportAuthorsModal() {
    if (!this.isReadOnly) {
      this.getAuthorsFromDOI();
      this.isModalOpen = false;
      this.isImportAuthorsModalOpen = true;
    }
  }

  closeImportAuthor() {
    this.isModalOpen = true;
    this.isImportAuthorsModalOpen = false;
  }

  saveAuthorsNgxs() {
    if (!this.isReadOnly) {
      const authorsA = [];
      this.manuscriptAuthors.forEach((author) => {
        if (author.checked) {
          authorsA.push(this.compileAuthor(author));
        }
      });
      this.store.dispatch(new People.Add({ contacts: authorsA })).subscribe(
        (completed) => {
          toastr.success("Authors imported.", "Success", this.toastrSettings);
        },
        (error) => {
          toastr.error(
            "Failed to import authors.",
            "Error",
            this.toastrSettings
          );
        }
      );
    }
  }

  compileAuthor(author) {
    const jsonConvert: JsonConvert = new JsonConvert();
    const mtblPerson = new MTBLSPerson();
    mtblPerson.lastName = author.lastName;
    mtblPerson.firstName = author.firstName;
    mtblPerson.midInitials = "";
    mtblPerson.email = "";
    mtblPerson.phone = "";
    mtblPerson.fax = "";
    mtblPerson.address = "";
    mtblPerson.affiliation = author.affiliation ? author.affiliation : "";
    mtblPerson.comments =
      author?.authorId?.type === "ORCID"
        ? [new MTBLSComment("Study Person ORCID", author.authorId.value)]
        : [];
    const role = jsonConvert.deserializeObject(
      JSON.parse(
        '{"annotationValue":"Author","comments":[],"termAccession":' +
          '"http://purl.obolibrary.org/obo/NCIT_C42781","termSource":{' +
          '"comments":[],"description":"NCI Thesaurus OBO Edition","file":' +
          '"http://purl.obolibrary.org/obo/ncit.owl","ontology_name":"NCIT",' +
          '"provenance_name":"NCIT","version":"18.10e"}}'
      ),
      Ontology
    );
    mtblPerson.roles.push(role);
    return mtblPerson.toJSON();
  }

  getAuthorsFromDOI() {
    this.publicationAbstract = "";
    const doi = this.getFieldValue("doi").replace("http://dx.doi.org/", "");
    this.setFieldValue("doi", doi);
    const doiURL = "http://dx.doi.org/" + doi;
    if (doi !== "") {
      this.europePMCService
        .getArticleInfo("DOI:" + doi.replace("http://dx.doi.org/", ""))
        .subscribe((article) => {
          console.dir(article);
          this.manuscriptAuthors = article.authorDetails;
        });
    }
  }

  ngOnInit() {
    if (this.publication === null) {
      this.addNewPublication = true;
    }
  }

  onChanges(value) {
    // support both ontology component and plain select/form-control
    const statusNew =
      this.statusComponent && Array.isArray(this.statusComponent.values)
        ? this.statusComponent.values
        : this.form?.controls?.status?.value || [];
    const prevStatus = this.form?.controls?.status?.value || [];

    if (JSON.stringify(prevStatus) !== JSON.stringify(statusNew)) {
      // update form control safely
      if (this.form && this.form.controls && this.form.controls.status) {
        this.form.controls.status.setValue(statusNew);
        if (Array.isArray(statusNew) && statusNew.length !== 0) {
          this.form.controls.status.markAsDirty();
        }
      }
    }
    if (this.form && this.form.controls && this.form.controls.doi) {
      this.setDoiRequiredBasedOnStatus();
      this.form.controls.doi.updateValueAndValidity();
    }
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
    if (this.isReadOnly) return;

    try {
      this._controlList = this.controlList();
    } catch (e) {
      this._controlList = null;
    }

    this.initialiseForm();

    try {
      const statusControl = this.form?.get("status");
      if (statusControl) {
        if (this._controlList && this._controlList.renderAsDropdown) {
          const initStr = this.publication?.status?.annotationValue || "";
          statusControl.setValue(initStr, { emitEvent: false });
        } else {
          const initObj = this.publication?.status || null;
          statusControl.setValue(initObj, { emitEvent: false });
        }
      }
    } catch (e) {
      console.warn("Failed to set status control initial value", e);
    }

    this.isModalOpen = true;
    this.publicationAbstract = "";
    this.getAbstract();

    this.cdRef.detectChanges();
  }

  confirmDelete() {
    this.isModalOpen = false;
    this.isDeleteModalOpen = true;
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
    this.isModalOpen = true;
  }

  confirmTitleUpdate() {
    this.isModalOpen = false;
    this.isUpdateTitleModalOpen = true;
  }

  confirmAbstractUpdate() {
    this.isModalOpen = false;
    this.isUpdateAbstractModalOpen = true;
  }

  closeUpdateTitleModal() {
    this.isUpdateTitleModalOpen = false;
    this.isModalOpen = true;
  }

  closeUpdateAbstractModal() {
    this.isUpdateAbstractModalOpen = false;
    this.isModalOpen = true;
  }

  updateStudyTitleNgxs() {
    const title = this.getFieldValue("title");
    this.store.dispatch(new Title.Update({ title })).subscribe((completed) => {
      toastr.success("Title updated.", "Success", this.toastrSettings);
      this.closeUpdateTitleModal();
      this.isFormBusy = false;
    });
  }

  getAbstract() {
    const doi = this.getFieldValue("doi").replace("http://dx.doi.org/", "");
    if (doi !== "") {
      this.europePMCService
        .getArticleInfo("DOI:" + doi.replace("http://dx.doi.org/", ""))
        .subscribe(
          (article) => {
            if (article.doi === doi) {
              this.publicationAbstract = article.abstract;
            }
          },
          (error) => {
            this.isFormBusy = false;
          }
        );
    } else {
      const pubMedID = this.getFieldValue("pubMedID");
      if (pubMedID !== "") {
        this.europePMCService
          .getArticleInfo("(SRC:MED AND EXT_ID:" + pubMedID + ")")
          .subscribe(
            (article) => {
              this.publicationAbstract = article.abstract;
            },
            (error) => {
              this.isFormBusy = false;
            }
          );
      }
    }
  }

  getArticleFromDOI() {
    this.publicationAbstract = "";
    const doi = this.getFieldValue("doi").replace("http://dx.doi.org/", "");
    this.setFieldValue("doi", doi);
    const doiURL = "http://dx.doi.org/" + doi;
    if (doi !== "") {
      this.doiService.getArticleInfo(doiURL).subscribe((article) => {
        this.setFieldValue("title", article.title.trim());
        this.setFieldValue("authorList", article.authorList.trim());

        // prefer updating ontology component if present, otherwise update form control
        const statusVals = ["Published"];
        if (
          this.statusComponent &&
          typeof this.statusComponent.setValue === "function"
        ) {
          try {
            this.statusComponent.setValue("Published");
            if (
              Array.isArray(this.statusComponent.values) &&
              this.statusComponent.values.length
            ) {
              // keep statusVals in sync with component
             
            }
          } catch (e) {
            // ignore component update failure
          }
        }
        if (this.form && this.form.controls && this.form.controls.status) {
          // set the same value into the form control (array or object as expected)
          this.form.controls.status.setValue(statusVals);
          this.setDoiRequiredBasedOnStatus();
          if (this.form.controls.doi) {
            this.form.controls.doi.updateValueAndValidity();
          }
          this.form.updateValueAndValidity();
        }
      });
      this.europePMCService
        .getArticleInfo("DOI:" + doi.replace("http://dx.doi.org/", ""))
        .subscribe((article) => {
          if (article.doi === doi) {
            this.setFieldValue("pubMedID", article.pubMedID.trim());
            this.publicationAbstract = article.abstract;
          }
        });
    }
  }
  statusValuesForComponent(): any[] {
    try {
      const v = this.form?.get('status')?.value;
      if (v === null || v === undefined || v === "") {
        return this.publication && this.publication.status ? [this.publication.status] : [];
      }

     if (this._controlList && this._controlList.renderAsDropdown) {
        const str = Array.isArray(v) ? (v[0] || "") : v;
        if (!str) return [];
        const candidates = this._controlList?.values || [];
        const match = candidates.find((c: any) => (c.annotationValue || c.value || c.label) === str);
        if (match) return [match];
        return [{ annotationValue: str }];
      }

      return Array.isArray(v) ? v : [v];
    } catch {
      return this.publication && this.publication.status ? [this.publication.status] : [];
    }
  }
  
  getArticleFromPubMedID() {
    this.publicationAbstract = "";
    const pubMedID = this.getFieldValue("pubMedID");
    if (pubMedID !== "") {
      this.europePMCService
        .getArticleInfo("(SRC:MED AND EXT_ID:" + pubMedID + ")")
        .subscribe((article) => {
          this.setFieldValue("title", article.title.trim());
          this.setFieldValue("authorList", article.authorList.trim());
          this.setFieldValue("doi", article.doi.trim());

          if (
            this.statusComponent &&
            typeof this.statusComponent.setValue === "function"
          ) {
            try {
              this.statusComponent.setValue("Published");
            } catch (e) {}
          }
          if (this.form && this.form.controls && this.form.controls.status) {
            this.form.controls.status.setValue(["Published"]);
            this.setDoiRequiredBasedOnStatus();
            if (this.form.controls.doi) {
              this.form.controls.doi.updateValueAndValidity();
            }
            this.form.updateValueAndValidity();
          }
          this.publicationAbstract = article.abstract;
        });
    }
  }

  initialiseForm() {
    if (!this.isReadOnly) {
      this.isFormBusy = false;

      if (this.publication === null || this.publication.title === "") {
        const mtblsPublication = new MTBLSPublication();
        this.publication = mtblsPublication;
        this.publication.status = [];
      }

      let statusInit = null;

      if (this.publication?.status) {
        statusInit = this._controlList?.renderAsDropdown
          ? this.publication.status?.annotationValue || ""
          : this.publication.status;
      } else {
        statusInit = this._controlList?.renderAsDropdown ? "" : null;
      }

      this.form = this.fb.group({
        pubMedID: [
          this.publication.pubMedID,
          ValidateRules("pubMedID", this.fieldValidation("pubMedID")),
        ],
        doi: [
          this.publication.doi,
          [
            ValidateRules("doi", this.fieldValidation("doi")),
            this.doiRequiredIfPublished(),
          ],
        ],
        authorList: [
          this.publication.authorList,
          ValidateRules("authorList", this.fieldValidation("authorList")),
        ],
        title: [
          this.publication.title,
          ValidateRules("title", this.fieldValidation("title")),
        ],
        status: [
          statusInit,
          ValidateRules("status", this.fieldValidation("status")),
        ],
      });
      
      // ensure DOI validator runs for initial status value
      if (this.form.controls.doi) {
        this.setDoiRequiredBasedOnStatus();
        this.form.controls.doi.updateValueAndValidity({
          onlySelf: true,
          emitEvent: false,
        });
      }
    }
  }

  // helper to decide if status contains Published or Preprint
  private isStatusPublishedOrPreprint(statusVal: any): boolean {
    const entries = Array.isArray(statusVal)
      ? statusVal
      : statusVal
      ? [statusVal]
      : [];
    return entries.some((s) => {
      if (!s) return false;
      if (typeof s === "string") {
        const vv = s.toLowerCase();
        return vv === "published" || vv === "preprint";
      }
      const annotation =
        s.annotationValue ||
        s.annotationvalue ||
        s.annotation ||
        s.termName ||
        s.label ||
        s.value;
      if (annotation && typeof annotation === "string") {
        const vv = annotation.toLowerCase();
        return vv === "published" || vv === "preprint";
      }
      return false;
    });
  }
  // toggle required validator on DOI based on status values
  private setDoiRequiredBasedOnStatus(): void {
    const statusVal = this.form?.controls?.status?.value;
    const mustBeRequired = this.isStatusPublishedOrPreprint(statusVal);

    const doiControl = this.form.controls.doi;
    if (!doiControl) return;

    const baseValidators = [
      ValidateRules("doi", this.fieldValidation("doi")),
      this.doiRequiredIfPublished(),
    ];

    const newValidators = mustBeRequired
      ? [...baseValidators, Validators.required]
      : baseValidators;
    doiControl.setValidators(newValidators);
  }

  // validator: DOI required when status is Published or Preprint
  doiRequiredIfPublished(): ValidatorFn {
    return (control: AbstractControl) => {
      const statusVal = this.form?.controls?.status?.value;
      const entries = Array.isArray(statusVal)
        ? statusVal
        : statusVal
        ? [statusVal]
        : [];

      const isPublishedOrPreprint = entries.some((s) => {
        if (!s) return false;
        if (typeof s === "string") {
          const vv = s.toLowerCase();
          return vv === "published" || vv === "preprint";
        }
        // common object shapes: { annotationValue: "Published" } or { termName, label, value }
        const annotation =
          s.annotationValue ||
          s.annotationvalue ||
          s.annotation ||
          s.termName ||
          s.label ||
          s.value;
        if (annotation && typeof annotation === "string") {
          const vv = annotation.toLowerCase();
          return vv === "published" || vv === "preprint";
        }
        return false;
      });

      const doiVal = control.value ?? "";
      if (isPublishedOrPreprint && String(doiVal).trim() === "") {
        // match existing error shape used by ValidateRules: { [field]: { error: string } }
        const msg = "DOI is required when status is Published or Preprint.";
        return { doi: { error: msg } };
      }
      return null;
    };
  }

  updateStudyAbstractNgxs() {
    if (!this.isReadOnly) {
      this.store
        .dispatch(new StudyAbstract.Update(this.publicationAbstract))
        .subscribe((completed) => {
          toastr.success(
            "Study abstract updated.",
            "Success",
            this.toastrSettings
          );
          this.closeUpdateAbstractModal();
        });
    }
  }

  private getStatusValue(): any | null {
    try {
      if (
        this.statusComponent &&
        Array.isArray(this.statusComponent.values) &&
        this.statusComponent.values.length > 0
      ) {
        return this.statusComponent.values[0];
      }
    } catch (_) {}

    // Fallback to form control
    const controlVal = this.form?.get("status")?.value;
    if (controlVal === null || controlVal === undefined) return null;
    if (Array.isArray(controlVal)) {
      return controlVal.length > 0 ? controlVal[0] : null;
    }
    // string or object
    return controlVal;
  }
  saveNgxs() {
    if (!this.isReadOnly) {
      const statusVal = this.getStatusValue();
      if (
        !statusVal ||
        (typeof statusVal === "object" &&
          Object.keys(statusVal).length === 0) ||
        (typeof statusVal === "string" && String(statusVal).trim() === "")
      ) {
        toastr.warning(
          "Publication status cannot be empty",
          "Warning",
          this.toastrSettings
        );
        return;
      }

      this.isFormBusy = true;
      if (!this.addNewPublication) {
        this.store
          .dispatch(
            new Publications.Update(this.publication.title, this.compileBody())
          )
          .subscribe(
            (completed) => {
              this.updatePublicationsNgxs("Publication updated.");
            },
            (error) => {
              this.isFormBusy = false;
            }
          );
      } else {
        this.store.dispatch(new Publications.Add(this.compileBody())).subscribe(
          (completed) => {
            this.updatePublicationsNgxs("Publication saved.");
            this.isModalOpen = false;
          },
          (error) => {
            this.isFormBusy = false;
          }
        );
      }
    }
  }

  compileBody() {
    const mtblPublication = new MTBLSPublication();
    mtblPublication.title = this.getFieldValue("title");
    mtblPublication.authorList = this.getFieldValue("authorList");
    mtblPublication.doi = this.getFieldValue("doi");
    mtblPublication.pubMedID = this.getFieldValue("pubMedID");
    mtblPublication.comments = [];
    const jsonConvert: JsonConvert = new JsonConvert();

    const statusRaw = this.getStatusValue();
    if (!statusRaw) {
      mtblPublication.status = null;
    } else {
      if (statusRaw instanceof Ontology) {
        mtblPublication.status = statusRaw;
      } else if (typeof statusRaw === "object") {
        try {
          mtblPublication.status = jsonConvert.deserializeObject(
            statusRaw,
            Ontology
          );
        } catch {
          const tmp = new Ontology();
          tmp.annotationValue =
            statusRaw.annotationValue ||
            statusRaw.termName ||
            statusRaw.label ||
            "";
          tmp.termAccession =
            statusRaw.termAccession ||
            statusRaw.termAccessionNumber ||
            statusRaw.iri ||
            "";
          tmp.termSource = new OntologySourceReference();
          tmp.termSource.name =
            statusRaw.termSourceRef || statusRaw.termSource?.name || "";
          mtblPublication.status = tmp;
        }
      } else if (typeof statusRaw === "string") {
        const tmp = new Ontology();
        tmp.annotationValue = statusRaw;
        tmp.termSource = new OntologySourceReference();
        tmp.termAccession = "";
        mtblPublication.status = tmp;
      } else {
        mtblPublication.status = null;
      }
    }

    return { publication: mtblPublication.toJSON() };
  }

  deleteNgxs() {
    if (!this.isReadOnly) {
      this.store
        .dispatch(new Publications.Delete(this.publication.title))
        .subscribe(
          (response) => {
            this.updatePublicationsNgxs("Publication Deleted");
            this.isDeleteModalOpen = false;
            this.isModalOpen = false;
          },
          (error) => {
            this.isFormBusy = false;
          }
        );
    }
  }

  updatePublicationsNgxs(message) {
    if (!this.isReadOnly) {
      this.form.markAsPristine();
      this.initialiseForm();
      this.isModalOpen = false;
      toastr.success(message, "Success", this.toastrSettings);
    }
  }

  closeModal() {
    this.isModalOpen = false;
    if(this.publication)
        this.showOntology = false;
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

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  isFieldRequired(field: string): boolean {
    try {
      const cfgRequired = JSON.parse(
        this.fieldValidation(field)?.["is-required"] ?? "false"
      );
      if (field === "doi") {
        if (cfgRequired) return true;
        const statusVal = this.form?.controls?.status?.value;
        return this.isStatusPublishedOrPreprint(statusVal);
      }
      return !!cfgRequired;
    } catch {
      return false;
    }
  }
  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }
  controlList() {
    if (
      !(this.defaultControlList && this.defaultControlList.name.length > 0) &&
      this.editorService.defaultControlLists &&
      this.defaultControlListName in this.editorService.defaultControlLists
    ) {
      this.defaultControlList.values =
        this.editorService.defaultControlLists[
          this.defaultControlListName
        ].OntologyTerm;
      this.defaultControlList.name = this.defaultControlListName;
    }

    let defaultOntologies = {};
    if (
      this.legacyControlLists &&
      this.legacyControlLists.controls &&
      this.legacyControlLists.controls["investigationFileControls"] &&
      this.legacyControlLists.controls["investigationFileControls"].__default__
    ) {
      const defaultRule =
        this.legacyControlLists.controls["investigationFileControls"]
          .__default__[0];
      defaultOntologies = defaultRule;
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

    return {
      ...this.defaultControlList,
      rule,
      defaultOntologies,
      renderAsDropdown,
    };
  }

  onEmptyError(isEmpty: boolean) {
    this.showError = isEmpty;
  }
}

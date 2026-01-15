import { Component, OnInit, Input, ViewChild, inject, Output, EventEmitter } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import { Ontology } from "../../../../models/mtbl/mtbls/common/mtbls-ontology";
import * as toastr from "toastr";
import { JsonConvert } from "json2typescript";
import { OntologyComponent } from "../../ontology/ontology.component";
import { EuropePMCService } from "../../../../services/publications/europePMC.service";
import { UntypedFormControl } from "@angular/forms";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";
import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable, timer } from "rxjs";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { Descriptors } from "src/app/ngxs-store/study/descriptors/descriptors.action";
import {
  getValidationRuleForField,
  MetabolightsFieldControls,
  StudyCategoryStr,
} from "src/app/models/mtbl/mtbls/control-list";

@Component({
  selector: "mtbls-design-descriptor",
  templateUrl: "./design-descriptor.component.html",
  styleUrls: ["./design-descriptor.component.css"],
})
export class DesignDescriptorComponent implements OnInit {
  studyReadonly$: Observable<boolean> = inject(Store).select(
    ApplicationState.readonly
  );
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(
    ApplicationState.toastrSettings
  );
  studyPublications$: Observable<IPublication[]> = inject(Store).select(
    GeneralMetadataState.publications
  );
  identifier$: Observable<string> = inject(Store).select(
    GeneralMetadataState.id
  );
  editorValidationRules$: Observable<Record<string, any>> = inject(
    Store
  ).select(ValidationState.rules);
  descriptors$: Observable<Ontology[]> = inject(Store).select(
    DescriptorsState.studyDesignDescriptors
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

  @Input("value") descriptor: Ontology;
  @Input("readOnly") readOnly: boolean;
  @Input("mode") mode: 'store' | 'local' = 'store';
  @Input() controlListKey: string = null;
  @Input() isaFileType: string = 'investigation';
  @Input() templateVersion: string = null;
  @Input() isaFileTemplateName: string = null;
  @Input() selectedStudyCategories: string[] = null;
  @Output() saved = new EventEmitter<Ontology>();
  @Output() deleted = new EventEmitter<Ontology>();

  @ViewChild(OntologyComponent) descriptorComponent: OntologyComponent;

  private studyId: string = "";
  private toastrSettings: Record<string, any> = {};
  isStudyReadOnly = false;
  defaultControlList: { name: string; values: any[] } = {
    name: "",
    values: [],
  };
  validations: any = {};
  validationsId = "studyDesignDescriptors";
  selectedPublication = new UntypedFormControl("", [Validators.required]);
  isModalOpen = false;
  isImportModalOpen = false;
  isDeleteModalOpen = false;
  publications: any = null;
  descriptors: any = null;
  form: UntypedFormGroup;
  isFormBusy = false;
  addNewDescriptor = false;
  keywords: any = [];
  selectedkeywords: any = [];
  status = "";
  loading = false;
  baseHref: string;
  private legacyControlLists: Record<string, any[]> | null = null;
  studyCategory: any;
  storeTemplateVersion: any;
  defaultControlListName = "Study Design Type";
  studyCreatedAt: any;
  private _controlList: any = null;
  isDescriptorValid = false;

  constructor(
    private fb: UntypedFormBuilder,
    private editorService: EditorService,
    private store: Store,
    private europePMCService: EuropePMCService
  ) {
    this.store.select(ApplicationState.controlLists).subscribe((lists) => {
      this.legacyControlLists = lists || {};
    });
    this.setUpSubscriptionsNgxs();
    this.baseHref = this.editorService.configService.baseHref;
  }

  setUpSubscriptionsNgxs() {
    this.identifier$.subscribe((id) => {
      if (id !== null) this.studyId = id;
    });
    this.toastrSettings$.subscribe((settings) => {
      this.toastrSettings = settings;
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyPublications$.subscribe((value) => {
      this.publications = value;
    });
    this.studyCategory$.subscribe((value) => {
      this.studyCategory = value as StudyCategoryStr;
    });
    this.templateVersion$.subscribe((value) => {
      this.storeTemplateVersion = value;
    });
    this.studyCreatedAt$.subscribe((value) => {
      this.studyCreatedAt = value;
    });
    this.descriptors$.subscribe((value) => {
      this.descriptors = value;
    });
    this.studyReadonly$.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  getKeyWords() {
    this.status = "";
    this.keywords = [];
    const doi = this.selectedPublication.value;
    this.europePMCService
      .getArticleKeyWords("DOI:" + doi.replace("http://dx.doi.org/", ""))
      .subscribe(
        (keywords) => {
          const sd = this.descriptors.map((d) => d.annotationValue);
          keywords.forEach((keyword) => {
            if (sd.indexOf(keyword) === -1) {
              this.keywords.push(keyword);
            }
          });
        },
        (error) => {
          console.error("Could not retrieve keywords for the publication");
        }
      );
  }

  isSelected(keyword) {
    if (this.selectedkeywords.indexOf(keyword) > -1) {
      return true;
    }
    return false;
  }

  toggleSelection(keyword) {
    const index = this.selectedkeywords.indexOf(keyword);
    if (index > -1) {
      this.selectedkeywords.splice(index, 1);
      this.deleteNgxs(keyword);
    } else {
      this.loading = true;
      this.status = "";
      this.status = "Mapping keyword to an ontology term";
        const validationType = this._controlList?.rule.validationType;
        const ontologies = this._controlList?.rule?.ontologies || [];
        const term = keyword;
        const allowedParentOntologyTerms =
          validationType === "child-ontology-term"
            ? this._controlList.rule.allowedParentOntologyTerms
            : undefined;
        const ruleName = this._controlList?.rule?.ruleName || this._controlList?.defaultOntologies?.ruleName || "";
        const fieldName = this._controlList?.rule?.fieldName || this._controlList?.defaultOntologies?.fieldName || "";
        const isExactMatchRequired = true;
        this.editorService
          .searchOntologyTermsWithRuleV2(
            term,
            isExactMatchRequired,
            ruleName,
            fieldName,
            validationType,
            ontologies,
            allowedParentOntologyTerms
          )
          .subscribe(
            (response) => {
            if (response.content && response.content.result && response.content.result.length > 0) {
              const jsonConvert: JsonConvert = new JsonConvert();
              const tempOntTerm = new Ontology();
              const t = response.content.result[0];
                  tempOntTerm.annotationValue = t.term;
                  tempOntTerm.termAccession = t.termAccessionNumber;
                  tempOntTerm.annotationDefinition = t.description || "";
                  tempOntTerm.termSource = new OntologySourceReference();
                  tempOntTerm.termSource.name = t.termSourceRef;
                  tempOntTerm.termSource.description = t.description || "";
                  tempOntTerm.termSource.file = "";
                  tempOntTerm.termSource.version = "";
                  tempOntTerm.termSource.provenance_name = "";
                  tempOntTerm.comments = []; // Keep empty
              const descriptor = {
                studyDesignDescriptor: jsonConvert.deserialize(
                  tempOntTerm,
                  Ontology
                ),
              };
              this.status = "Adding keyword to the study design descriptors list";
               this.loading = true;
                this.isFormBusy = true;
              setTimeout(() => {
                if (this.mode === 'local') {
                    // Not supported in local mode via keyword selection yet unless refactored
                    // But assume this flow is mostly for existing studies
                    this.store.dispatch(
                      new Descriptors.New(descriptor, this.studyId)
                    );
                } else {
                    this.store.dispatch(
                      new Descriptors.New(descriptor, this.studyId)
                    );
                }

                  this.loading = false;
                  this.isFormBusy = false;
                  this.status = "Added keyword successfully";
              }
              , 100);
            } else {
              this.status =
                "Exact ontology match not found. Create new MetaboLights Ontology term";
              const newOntology = new Ontology();
              newOntology.annotationValue = keyword;
              newOntology.termAccession = "";
              newOntology.termSource = new OntologySourceReference();
              newOntology.termSource.description = "User defined terms";
              newOntology.termSource.file = "";
              newOntology.termSource.name = "";
              newOntology.termSource.provenance_name = "";
              newOntology.termSource.version = "";
              newOntology.comments = []; // Keep empty
              const jsonConvert: JsonConvert = new JsonConvert();
              const descriptor = {
                studyDesignDescriptor: jsonConvert.deserialize(
                  newOntology,
                  Ontology
                ),
              };
              this.status = "Adding keyword to the study design descriptors list";
              this.loading = true;
              this.isFormBusy = true;
              setTimeout(() => {
                if(this.mode === 'local') {
                     // Not supported yet
                    this.store.dispatch(
                      new Descriptors.New(descriptor, this.studyId)
                    );
                } else {
                    this.store.dispatch(
                      new Descriptors.New(descriptor, this.studyId)
                    );
                }
                  this.loading = false;
                  this.isFormBusy = false;
                  this.status = "Added keyword successfully";
              }
              , 100);
            }
          });
    }
  }

  ngOnInit() {
    if (this.descriptor === null) {
      this.addNewDescriptor = true;
    }
  }

  onChanges(e) {
    try {
      const controlList = this._controlList || this.controlList();
      const descriptorControl = this.form?.get("descriptor");

      if (controlList && !controlList.renderAsDropdown) {
        if (Array.isArray(e)) {
          descriptorControl?.setValue(e, { emitEvent: false });

          this.form?.markAsDirty();

          this.isDescriptorValid = e.length > 0;
        }
      } else {
        const val = descriptorControl?.value;

        this.form?.markAsDirty();

        this.isDescriptorValid = !!val; // true if not null/empty
      }
    } catch {}
  }

  openImportModal() {
    this.closeModal();
    this.isImportModalOpen = true;
  }

  openModal() {
    if (!this.readOnly && !this.isStudyReadOnly) {
      this._controlList = this.controlList();
      this.isModalOpen = true;
      this.initialiseForm();
      if (this.addNewDescriptor) {
        this.descriptor = null;
        if (this.descriptorComponent) {
          this.descriptorComponent.reset();
        }
      } else {
        if (this.descriptor) {
          if (this.descriptorComponent) {
            this.descriptorComponent.values = [this.descriptor];
          }
          if (this.form && this.form.get("descriptor")) {
            const controlList = this._controlList || this.controlList();
            if (controlList && controlList.renderAsDropdown) {
              this.form
                .get("descriptor")
                .setValue(this.descriptor.annotationValue || "", {
                  emitEvent: false,
                });
            } else {
              this.form
                .get("descriptor")
                .setValue([this.descriptor], { emitEvent: false });
            }
          }
        }
      }
    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    const controlList = this._controlList || this.controlList();
    const isRequired = controlList?.rule?.termEnforcementLevel === 'required';
    this.form = this.fb.group({
      descriptor: [null, isRequired ? [Validators.required] : []],
    });
  }

  confirmDelete() {
    this.isModalOpen = false;
    this.isDeleteModalOpen = true;
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.descriptorComponent?.reset();
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  saveNgxs() {
    const descriptorValues = this.descriptorValuesForComponent();
    
    if (this.mode === 'local') {
         if (descriptorValues && descriptorValues.length > 0) {
             const body = this.compileBody(descriptorValues[0]);
             // Extract Ontology from body.studyDesignDescriptor
             const ontology = body.studyDesignDescriptor;
             this.saved.emit(ontology);
             this.closeModal();
         }
         return;
    }
    
    if (!this.isStudyReadOnly && descriptorValues.length > 0) {
      this.isFormBusy = true;
      if (!this.addNewDescriptor) {
        this.store.dispatch(
          new Descriptors.Update(
            this.descriptor.annotationValue,
            this.compileBody(),
            this.studyId
          )
        );
      } else {
        this.loading = true;
        this.isFormBusy = true;
        this.store.dispatch(
          new Descriptors.New(this.compileBody(), this.studyId)
        );
        const oneSecondTimer = timer(1000);
        oneSecondTimer.subscribe(() => {
          this.closeModal();
        });
      }
    }
  }

  updateAndCloseNgxs() {
    this.store.dispatch(
      new Descriptors.Get(
        this.studyId
      )
    );
    this.closeImportModal();
  }

  refreshDesignDescriptors(message) {
    this.isFormBusy = true;
    this.isFormBusy = false;
    if (message !== "Design descriptor updated.") {
      if (this.form !== undefined) {
        this.form.markAsPristine();
      }
    }
    if (
      !["Design descriptor updated.", "Design descriptor deleted."].includes(
        message
      )
    ) {
      this.initialiseForm();
      this.descriptorComponent.reset();
      this.isModalOpen = true;
    }
  }

  deleteNgxs(value) {
    if(this.mode === 'local') {
          this.deleted.emit(this.descriptor);
          this.isDeleteModalOpen = false;
          return;
    }
    
    if (!this.isStudyReadOnly) {
      if (!value) {
        value = this.descriptor.annotationValue;
      }
      this.isFormBusy = true;
      this.store.dispatch(new Descriptors.Delete(value, this.studyId));
    }
  }

  compileBody(val: any = null) {
    const jsonConvert: JsonConvert = new JsonConvert();
    const descriptorValues = val ? [val] : this.descriptorValuesForComponent();
    const descriptorRaw =
      descriptorValues.length > 0 ? descriptorValues[0] : null;

    let studyDesignDescriptor: Ontology | null = null;
    if (!descriptorRaw) {
      studyDesignDescriptor = null;
    } else {
      if (descriptorRaw instanceof Ontology) {
        studyDesignDescriptor = descriptorRaw;
      } else if (typeof descriptorRaw === "object") {
        try {
          studyDesignDescriptor = jsonConvert.deserializeObject(
            descriptorRaw,
            Ontology
          );
        } catch {
          const tmp = new Ontology();
          tmp.annotationValue =
            descriptorRaw.annotationValue ||
            descriptorRaw.termName ||
            descriptorRaw.label ||
            "";
          tmp.termAccession =
            descriptorRaw.termAccession ||
            descriptorRaw.termAccessionNumber ||
            descriptorRaw.iri ||
            "";
          tmp.termSource = new OntologySourceReference();
          tmp.termSource.name =
            descriptorRaw.termSourceRef || descriptorRaw.termSource?.name || "";
          studyDesignDescriptor = tmp;
        }
      } else if (typeof descriptorRaw === "string") {
        const tmp = new Ontology();
        tmp.annotationValue = descriptorRaw;
        tmp.termSource = new OntologySourceReference();
        tmp.termAccession = "";
        studyDesignDescriptor = tmp;
      } else {
        studyDesignDescriptor = null;
      }
    }

    const body = {
      studyDesignDescriptor: studyDesignDescriptor,
    };
    return body;
  }

  fieldValidation(fieldId) {
    return this.validation[fieldId];
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
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

  controlList() {
    const listName = this.controlListKey || this.defaultControlListName;
    
    if (
      !(this.defaultControlList && this.defaultControlList.name.length > 0) &&
      this.editorService.defaultControlLists &&
      listName in this.editorService.defaultControlLists
    ) {
      this.defaultControlList.values =
        this.editorService.defaultControlLists[listName]
          .OntologyTerm || [];
      this.defaultControlList.name = listName;
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
      studyCategory: this.selectedStudyCategories ? this.selectedStudyCategories : this.studyCategory,
      studyCreatedAt: this.studyCreatedAt,
      isaFileType: this.isaFileType ? this.isaFileType : "investigation",
      isaFileTemplateName: this.isaFileTemplateName,
      templateVersion: this.templateVersion ? this.templateVersion : (this.store.selectSnapshot(GeneralMetadataState.templateVersion)),
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
          listName,
          selectionInput
        );
      }
    } catch (e) {
      rule = null;
    }

    let renderAsDropdown = false;
    if (
      rule &&
      rule.validationType === "selected-ontology-term" &&
      rule.termEnforcementLevel === "required"
    ) {
      renderAsDropdown = true;
      if (Array.isArray(rule.terms) && rule.terms.length > 0) {
        const mapped = rule.terms.map((t: any) => {
          const o = new Ontology();
          o.annotationValue = t.term || t.label || "";
          o.termAccession = t.termAccessionNumber || t.termAccession || "";
          o.termSource = new OntologySourceReference();
          o.termSource.name =
            t.termSourceRef || (t.termSource && t.termSource.name) || "";
          o.termSource.description = t.termSource?.description || "";
          o.termSource.file = t.provenance_uri || "";
          o.termSource.version = t.version || "";
          o.termSource.provenance_name = t.provenance_name || "";
          return o;
        });
        this.defaultControlList.values = mapped;
      }
    }

    const valuesArray = Array.isArray(this.defaultControlList.values)
      ? this.defaultControlList.values
      : [];

    const result = {
      ...this.defaultControlList,
      values: valuesArray,
      rule,
      defaultOntologies,
      renderAsDropdown,
    };
    this._controlList = result;
    return result;
  }
  descriptorValuesForComponent(): any[] {
    try {
      const v =
        this.descriptorComponent &&
        Array.isArray(this.descriptorComponent.values)
          ? this.descriptorComponent.values
          : this.form?.get("descriptor")?.value || [];

      if (this.form && this.form.get("descriptor")) {
        return Array.isArray(v) ? v : [v];
      }

      // Fallback for when form is not initialized (e.g., initial load)
      if (v === null || v === undefined || v === "") {
        return this.descriptor ? [this.descriptor] : [];
      }
      const controlList = this._controlList || this.controlList();

      if (controlList && controlList.renderAsDropdown) {
        const str = Array.isArray(v) ? v[0] || "" : v;
        if (!str) return [];
        const candidates = controlList?.values || [];
        const match = candidates.find(
          (c: any) => (c.annotationValue || c.value || c.label) === str
        );
        if (match) return [match]; 
        return [{ annotationValue: str }]; 
      }

      return Array.isArray(v) ? v : [v];
    } catch {
      return this.descriptor ? [this.descriptor] : [];
    }
  }
}

import {
  Component,
  OnInit,
  Input,
  ViewChild,
  inject,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
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
import { getValidationRuleForField, MetabolightsFieldControls, StudyCategoryStr } from "src/app/models/mtbl/mtbls/control-list";
@Component({
  selector: "mtbls-design-descriptor",
  templateUrl: "./design-descriptor.component.html",
  styleUrls: ["./design-descriptor.component.css"],
})
export class DesignDescriptorComponent implements OnInit {

  studyReadonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  studyPublications$: Observable<IPublication[]> = inject(Store).select(GeneralMetadataState.publications);
  identifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  descriptors$: Observable<Ontology[]> = inject(Store).select(DescriptorsState.studyDesignDescriptors);
  
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

  @ViewChild(OntologyComponent) descriptorComponent: OntologyComponent;

  private studyId: string = ""
  private toastrSettings: Record<string, any> = {};

  isStudyReadOnly = false;
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
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
  templateVersion: any;
  defaultControlListName = "Study Design Type";
  studyCreatedAt: any;
  
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
      if(id !== null) this.studyId = id
    });
    this.toastrSettings$.subscribe((settings) => {
      this.toastrSettings = settings
    })
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
      this.templateVersion = value;
    });
    this.studyCreatedAt$.subscribe((value) => {
      this.studyCreatedAt = value;
    });
    this.studyReadonly$.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  getKeyWords() {
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
        (error) => {}
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
      this.editorService
        .getExactMatchOntologyTerm(keyword, "Study%20Design%20Type")
        .subscribe((terms) => {
          if (terms.OntologyTerm.length > 0) {
            const jsonConvert: JsonConvert = new JsonConvert();
            const descriptor = {
              studyDesignDescriptor: jsonConvert.deserialize(
                terms.OntologyTerm[0],
                Ontology
              ),
            };
            this.status = "Adding keyword to the study design descriptors list";
            this.isFormBusy = true;
            this.loading = true;
            // needs changing to dispatch
            this.store.dispatch(new Descriptors.New(descriptor, this.studyId));
            

          } else {
            this.status =
              "Exact ontology match not found. Create new MetaboLights Onotology term";
            const newOntology = new Ontology();
            newOntology.annotationValue = keyword;
            newOntology.termAccession = "";
            newOntology.termSource = new OntologySourceReference();
            newOntology.termSource.description = "User defined terms";
            newOntology.termSource.file = "";
            newOntology.termSource.name = "";
            newOntology.termSource.provenance_name = "";
            newOntology.termSource.version = "";
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

            // needs changing to dispatch
            this.store.dispatch(new Descriptors.New(descriptor, this.studyId));


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
    if (this.descriptorComponent.values && this.descriptorComponent.values[0]) {
      this.form.markAsDirty();
    }
  }

  openImportModal() {
    this.closeModal();
    this.isImportModalOpen = true;
  }

  openModal() {
    if (!this.readOnly && !this.isStudyReadOnly) {
      this.isModalOpen = true;
      this.initialiseForm();
      if (this.addNewDescriptor) {
        this.descriptor = null;
        if (this.descriptorComponent) {
          this.descriptorComponent.reset();
        }
      }
      const jsonConvert: JsonConvert = new JsonConvert();
      if (this.descriptorComponent) {
        this.descriptorComponent.values[0] = jsonConvert.deserializeObject(
          this.descriptor,
          Ontology
        );
      }
    }
  }

  initialiseForm() {
    this.isFormBusy = false;
    this.form = this.fb.group({});
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
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }


  saveNgxs() {
    if (!this.isStudyReadOnly && this.descriptorComponent.values[0]) {
      this.isFormBusy = true;
      if (!this.addNewDescriptor){ // If we are updating an exisiting descriptor
        this.store.dispatch(
          new Descriptors.Update(
            this.descriptor.annotationValue, this.compileBody(), this.studyId)
            )
          // After this point, the change will be fed through to the selector - we must do any callback stuff in there
      } else { // If we are saving a  new descriptor
        this.loading = true;
        this.isFormBusy = true;
        this.store.dispatch(
          new Descriptors.New(
            this.compileBody(), this.studyId
          )
        )
        // this is a quick fix - a large scale refactor to move away from inline modals is required.
        const oneSecondTimer = timer(1000);
        oneSecondTimer.subscribe(() => {
          this.closeModal();
        });

      }
    }
  }


  refreshDesignDescriptors(message) {
    this.isFormBusy = true;

    // MAY NEED REVISITING
    this.isFormBusy = false;
    if (message !== "Design descriptor updated.") {
      if (this.form !== undefined) {
        this.form.markAsPristine();
      }
    }
    if (!["Design descriptor updated.", "Design descriptor deleted."].includes(message)) {
      this.initialiseForm();
      this.descriptorComponent.reset();
      this.isModalOpen = true;
    }
    //toastr.success(message, "Success", this.toastrSettings);

  }



  deleteNgxs(value) {
    if (!this.isStudyReadOnly) {
      if (!value) {
        value = this.descriptor.annotationValue;
      }
      this.isFormBusy = true;
      this.store.dispatch(new Descriptors.Delete(value, this.studyId));
    }
  }

  compileBody() {
    const jsonConvert: JsonConvert = new JsonConvert();
    const body = {
      studyDesignDescriptor: jsonConvert.deserialize(
        this.descriptorComponent.values[0],
        Ontology
      ),
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
    return this.validations[this.validationsId];
  }

  controlList() {
      if (!(this.defaultControlList && this.defaultControlList.name.length > 0)
        && this.editorService.defaultControlLists && this.defaultControlListName in this.editorService.defaultControlLists) {
        this.defaultControlList.values = this.editorService.defaultControlLists[this.defaultControlListName].OntologyTerm;
        this.defaultControlList.name = this.defaultControlListName;
      }
  
      
      let defaultOntologies = [];
        if (this.legacyControlLists && this.legacyControlLists.controls && this.legacyControlLists.controls["investigationFileControls"] && this.legacyControlLists.controls["investigationFileControls"].__default__) {
        const defaultRule = this.legacyControlLists.controls["investigationFileControls"].__default__[0];
        defaultOntologies =  defaultRule?.ontologies;
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
  
      return {
        ...this.defaultControlList,
        rule,
        defaultOntologies
      };
    }

}

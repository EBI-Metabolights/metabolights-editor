import {
  Component,
  OnInit,
  Input,
  Inject,
  ViewChild,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import { Ontology } from "../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "../../../../store";
import * as toastr from "toastr";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { OntologyComponent } from "../../ontology/ontology.component";
import { DOIService } from "../../../../services/publications/doi.service";
import { EuropePMCService } from "../../../../services/publications/europePMC.service";
import { FormControl } from "@angular/forms";
import { OntologySourceReference } from "src/app/models/mtbl/mtbls/common/mtbls-ontology-reference";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata.state";
import { Observable } from "rxjs";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { ApplicationState } from "src/app/ngxs-store/application.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
@Component({
  selector: "mtbls-design-descriptor",
  templateUrl: "./design-descriptor.component.html",
  styleUrls: ["./design-descriptor.component.css"],
})
export class DesignDescriptorComponent implements OnInit {
  @select((state) => state.study.validations) studyValidations;
  @select((state) => state.study.publications) studyPublications;

  @select((state) => state.study.readonly) studyReadonly;
  @select((state) => state.study.studyDesignDescriptors) studyDescriptors;

  @Select(ApplicationState.readonly) studyReadonly$: Observable<boolean>;
  @Select(GeneralMetadataState.publications) studyPublications$: Observable<IPublication[]>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(DescriptorsState.studyDesignDescriptors) descriptors$: Observable<Ontology[]>;

  @Input("value") descriptor: Ontology;
  @Input("readOnly") readOnly: boolean;

  @ViewChild(OntologyComponent) descriptorComponent: OntologyComponent;

  isStudyReadOnly = false;
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  validations: any = {};

  validationsId = "studyDesignDescriptors";
  selectedPublication = new FormControl("", [Validators.required]);

  isModalOpen = false;
  isImportModalOpen = false;
  isDeleteModalOpen = false;
  publications: any = null;
  descriptors: any = null;

  form: FormGroup;
  isFormBusy = false;
  addNewDescriptor = false;
  keywords: any = [];
  selectedkeywords: any = [];
  status = "";

  loading = false;
  baseHref: string;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>,
    private doiService: DOIService,
    private europePMCService: EuropePMCService
  ) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
    this.baseHref = this.editorService.configService.baseHref;
  }

  setUpSubscriptions() {
    this.studyValidations.subscribe((value) => {
      this.validations = value;
    });
    this.studyPublications.subscribe((value) => {
      this.publications = value;
    });
    this.studyDescriptors.subscribe((value) => {
      this.descriptors = value;
    });
    this.studyReadonly.subscribe((value) => {
      if (value != null) {
        this.isStudyReadOnly = value;
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyPublications$.subscribe((value) => {
      this.publications = value;
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


  //NEEDS STATE REFACTOR
  updateAndClose() {
    this.isFormBusy = true;
    this.editorService.getDesignDescriptors().subscribe((res) => {
      this.ngRedux.dispatch({
        type: "UPDATE_STUDY_DESIGN_DESCRIPTORS",
        body: {
          studyDesignDescriptors: res.studyDesignDescriptors,
        },
      });
      this.isFormBusy = false;
    },
    (err) => {
      this.isFormBusy = false;
    }
    );
    this.closeImportModal();
  }

  toogleSelection(keyword) {
    const index = this.selectedkeywords.indexOf(keyword);
    if (index > -1) {
      this.selectedkeywords.splice(index, 1);
      this.delete(keyword);
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
            this.editorService.saveDesignDescriptor(descriptor).subscribe(
              (res) => {
                this.status = "";
                this.selectedkeywords.push(keyword);
                this.loading = false;
                this.isFormBusy = false;
              },
              (err) => {
                this.loading = false;
                this.status = "";
                this.isFormBusy = false;
              }
            );
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
            this.editorService.saveDesignDescriptor(descriptor).subscribe(
              (res) => {
                this.selectedkeywords.push(keyword);
                this.loading = false;
                this.status = "";
                this.isFormBusy = false;
              },
              (err) => {
                this.loading = false;
                this.isFormBusy = false;
                this.status = "";
              }
            );
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

  save() {
    if (!this.isStudyReadOnly) {
      if (this.descriptorComponent.values[0]) {
        this.isFormBusy = true;
        if (!this.addNewDescriptor) {
          this.editorService
            .updateDesignDescriptor(
              this.descriptor.annotationValue,
              this.compileBody()
            )
            .subscribe(
              (res) => {
                this.updateDesignDescriptors(res, "Design descriptor updated.");
              },
              (err) => {
                this.isFormBusy = false;
              }
            );
        } else {
          const ontology = this.compileBody();
          this.loading = true;
          this.isFormBusy = true;
          this.editorService.saveDesignDescriptor(ontology).subscribe(
            (res) => {
              this.updateDesignDescriptors(res, "Design descriptor saved.");
              this.descriptorComponent.values = [];
              this.isModalOpen = false;
              this.loading = false;
              this.isFormBusy = false;
            },
            (err) => {
              this.isFormBusy = false;
              this.loading = false;
            }
          );
        }
      }
    }
  }

  updateDesignDescriptors(data, message) {
    this.isFormBusy = true;
    this.editorService.getDesignDescriptors().subscribe((res) => {
      this.ngRedux.dispatch({
        type: "UPDATE_STUDY_DESIGN_DESCRIPTORS",
        body: {
          studyDesignDescriptors: res.studyDesignDescriptors,
        },
      });
      this.isFormBusy = false;
    },
    (err) => {
      this.isFormBusy = false;
    }
    );

    this.form.markAsPristine();
    this.initialiseForm();
    this.isModalOpen = true;

    this.descriptorComponent.reset();

    toastr.success(message, "Success", {
      timeOut: "2500",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: false,
    });
  }

  delete(value) {
    if (!this.isStudyReadOnly) {
      if (!value) {
        value = this.descriptor.annotationValue;
      }
      this.isFormBusy = true;
      this.editorService.deleteDesignDescriptor(value).subscribe(
        (res) => {
          this.updateDesignDescriptors(res, "Design descriptor deleted.");
          this.isDeleteModalOpen = false;
          this.isModalOpen = false;
          this.isFormBusy = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
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
      && this.editorService.defaultControlLists && "Study Design Type" in this.editorService.defaultControlLists){
      this.defaultControlList.values = this.editorService.defaultControlLists["Study Design Type"].OntologyTerm;
      this.defaultControlList.name = "Study Design Type";
    }
    return this.defaultControlList;
  }

}

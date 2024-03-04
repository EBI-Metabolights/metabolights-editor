import { EditorService } from "../../../../services/editor.service";
import { DOIService } from "../../../../services/publications/doi.service";
import { EuropePMCService } from "../../../../services/publications/europePMC.service";
import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MTBLSComment } from "./../../../../models/mtbl/mtbls/common/mtbls-comment";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../../models/mtbl/mtbls/mtbls-publication";
import { trigger, style, animate, transition } from "@angular/animations";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./publication.validator";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "../../../../store";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import * as toastr from "toastr";
import { MTBLSPerson } from "./../../../../models/mtbl/mtbls/mtbls-person";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/application.state";
import { Observable } from "rxjs";

@Component({
  selector: "mtbls-publication",
  templateUrl: "./publication.component.html",
  styleUrls: ["./publication.component.css"],
})
export class PublicationComponent implements OnInit {
  @Input("value") publication: any;
  @select((state) => state.study.validations) studyValidations: any;

  @ViewChild(OntologyComponent) statusComponent: OntologyComponent;

  @select((state) => state.study.readonly) readonly;

  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;

  isReadOnly = false;

  form: FormGroup;
  isFormBusy = false;
  addNewPublication = false;

  validations: any;
  validationsId = "publications.publication";
  defaultControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultControlListName = "Study Publication Status";
  isModalOpen = false;
  isTimeLineModalOpen = false;
  isDeleteModalOpen = false;
  isUpdateTitleModalOpen = false;
  isUpdateAbstractModalOpen = false;
  isImportAuthorsModalOpen = false;

  manuscriptAuthors: any = null;

  publicationAbstract = "";

  constructor(
    private fb: FormBuilder,
    private doiService: DOIService,
    private europePMCService: EuropePMCService,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = {name: "", values: []};
    }
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyValidations.subscribe((value) => {
      this.validations = value;
    });
    this.readonly.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
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

  saveAuthors() {
    if (!this.isReadOnly) {
      const authorsA = [];
      this.manuscriptAuthors.forEach((author) => {
        if (author.checked) {
          authorsA.push(this.compileAuthor(author));
        }
      });

      this.editorService.savePerson({ contacts: authorsA }).subscribe(
        (res) => {
          toastr.success("Authors imported.", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.manuscriptAuthors.forEach((author) => {
            author.checked = false;
          });
        },
        (err) => {
          toastr.error("Failed to import authors.", "Error", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
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
    this.form.markAsDirty();
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
    if (!this.isReadOnly) {
      this.initialiseForm();
      this.isModalOpen = true;
      this.publicationAbstract = "";
      this.getAbstract();
    }
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

  updateStudyTitle() {
    if (!this.isReadOnly) {
      this.editorService
        .saveTitle({ title: this.getFieldValue("title") })
        .subscribe((res) => {
          this.ngRedux.dispatch({ type: "SET_STUDY_TITLE", body: res });
          toastr.success("Title updated.", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.closeUpdateTitleModal();
        });
    }
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
        this.statusComponent.setValue("Published");
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
          this.publicationAbstract = article.abstract;
        });
    }
  }

  initialiseForm() {
    if (!this.isReadOnly) {
      this.isFormBusy = false;

      if (this.publication === null) {
        const mtblsPublication = new MTBLSPublication();
        this.publication = mtblsPublication;
      }

      this.form = this.fb.group({
        pubMedID: [
          this.publication.pubMedID,
          ValidateRules("pubMedID", this.fieldValidation("pubMedID")),
        ],
        doi: [
          this.publication.doi,
          ValidateRules("doi", this.fieldValidation("doi")),
        ],
        authorList: [
          this.publication.authorList,
          ValidateRules("authorList", this.fieldValidation("authorList")),
        ],
        title: [
          this.publication.title,
          ValidateRules("title", this.fieldValidation("title")),
        ],
      });
    }
  }

  updateStudyAbstract() {
    if (!this.isReadOnly) {
      this.editorService
        .saveAbstract({ description: this.publicationAbstract })
        .subscribe(
          (res) => {
            this.ngRedux.dispatch({ type: "SET_STUDY_ABSTRACT", body: res });
            toastr.success("Study abstract updated.", "Success", {
              timeOut: "2500",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            });
            this.closeUpdateAbstractModal();
          },
          (error) => {
            this.isFormBusy = false;
          }
        );
    }
  }

  save() {
    if (!this.isReadOnly) {
      if (this.statusComponent.values[0] === undefined) {
        toastr.warning("Publication status cannot be empty", "Warning", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      } else {
        this.isFormBusy = true;
        if (!this.addNewPublication) {
          this.editorService
            .updatePublication(this.publication.title, this.compileBody())
            .subscribe(
              (res) => {
                this.updatePublications(res, "Publication updated.");
              },
              (err) => {
                this.isFormBusy = false;
              }
            );
        } else {
          this.editorService.savePublication(this.compileBody()).subscribe(
            (res) => {
              this.updatePublications(res, "Publication saved.");
              this.isModalOpen = false;
            },
            (err) => {
              this.isFormBusy = false;
            }
          );
        }
      }
    }
  }

  delete() {
    if (!this.isReadOnly) {
      this.editorService.deletePublication(this.publication.title).subscribe(
        (res) => {
          this.updatePublications(res, "Publication deleted.");
          this.isDeleteModalOpen = false;
          this.isModalOpen = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
    }
  }

  updatePublications(data, message) {
    if (!this.isReadOnly) {
      this.editorService.getPublications().subscribe((res) => {
        this.form.markAsPristine();
        this.initialiseForm();
        this.isModalOpen = false;

        toastr.success(message, "Success", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      });
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
    mtblPublication.status = jsonConvert.deserializeObject(
      this.statusComponent.values[0],
      Ontology
    );
    return { publication: mtblPublication.toJSON() };
  }

  closeModal() {
    this.isModalOpen = false;
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

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
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

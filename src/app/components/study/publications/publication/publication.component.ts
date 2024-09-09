import { EditorService } from "../../../../services/editor.service";
import { DOIService } from "../../../../services/publications/doi.service";
import { EuropePMCService } from "../../../../services/publications/europePMC.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
} from "@angular/core";
import { Ontology } from "./../../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../../models/mtbl/mtbls/mtbls-publication";
import { trigger, style, animate, transition } from "@angular/animations";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./publication.validator";
import { OntologyComponent } from "../../../shared/ontology/ontology.component";
import { JsonConvert } from "json2typescript";
import * as toastr from "toastr";
import { MTBLSPerson } from "./../../../../models/mtbl/mtbls/mtbls-person";
import { Select, Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { People, Publications, StudyAbstract, Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-publication",
  templateUrl: "./publication.component.html",
  styleUrls: ["./publication.component.css"],
})
export class PublicationComponent implements OnInit {
  @Input("value") publication: any;

  @ViewChild(OntologyComponent) statusComponent: OntologyComponent;

  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(ApplicationState.toastrSettings) toastrSettings$: Observable<Record<string, any>>;
  @Select(GeneralMetadataState.id) id$: Observable<string>;
  @Select(GeneralMetadataState.title) title$: Observable<string>;
  @Select(GeneralMetadataState.description) description$: Observable<string>;

  private title: string = ""
  private description: string = ""

  toastrSettings: Record<string, any> = {};

  isReadOnly = false;

  form: UntypedFormGroup;
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
    private fb: UntypedFormBuilder,
    private doiService: DOIService,
    private europePMCService: EuropePMCService,
    private editorService: EditorService,
    private store: Store
  ) {
    if (!this.defaultControlList) {
      this.defaultControlList = {name: "", values: []};
    }
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
    this.title$.subscribe((value) => {

    });
    this.description$.subscribe((value) => {

    })
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
      this.store.dispatch(new People.Add({contacts: authorsA})).subscribe(
        (completed) => {
          toastr.success("Authors imported.", "Success", this.toastrSettings);
        },
        (error) => {
          toastr.error("Failed to import authors.", "Error", this.toastrSettings);
        }
      )

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



  updateStudyTitleNgxs() {
    const title = this.getFieldValue("title");
    this.store.dispatch(new Title.Update({title})).subscribe(
      (completed) => {
        toastr.success("Title updated.", "Success", this.toastrSettings);
        this.closeUpdateTitleModal();
        this.isFormBusy = false;
      }
    );
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


  updateStudyAbstractNgxs() {
    if (!this.isReadOnly)  {
      this.store.dispatch(new StudyAbstract.Update(this.publicationAbstract)).subscribe(
        (completed) => {
            toastr.success("Study abstract updated.", "Success", this.toastrSettings);
            this.closeUpdateAbstractModal();
        }
      );
    }

  }


  saveNgxs() {
    if (!this.isReadOnly) {
      if (this.statusComponent.values[0] === undefined) {
        toastr.warning("Publication status cannot be empty", "Warning", this.toastrSettings);
      } else {
        this.isFormBusy = true;
        if(!this.addNewPublication) {// if we are updating a publication
          this.store.dispatch(new Publications.Update(this.publication.title, this.compileBody())).subscribe(
            (completed) => {
              this.updatePublicationsNgxs("Publication updated.");
            },
            (error) => {
              this.isFormBusy = false;
            }
          );
        } else { // if we are adding a new publication
          this.store.dispatch(new Publications.Add(this.compileBody())).subscribe(
            (completed) => {
                this.updatePublicationsNgxs("Publication saved.");
                this.isModalOpen = false;
              },
              (error) => {
                this.isFormBusy = false;
              }
            )
        }
      }
    }
  }

  deleteNgxs() {
    if (!this.isReadOnly) {
      this.store.dispatch(new Publications.Delete(this.publication.title)).subscribe(
        (response) => {
            this.updatePublicationsNgxs("Publication Deleted");
            this.isDeleteModalOpen = false;
            this.isModalOpen = false;
          },
          (error) => {
            this.isFormBusy = false;
          }
        )
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

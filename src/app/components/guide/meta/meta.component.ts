import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import { select } from "@angular-redux/store";
import { MTBLSPerson } from "./../../../models/mtbl/mtbls/mtbls-person";
import { Ontology } from "./../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../models/mtbl/mtbls/mtbls-publication";
import { JsonConvert } from "json2typescript";
import { DOIService } from "../../../services/publications/doi.service";
import { EuropePMCService } from "../../../services/publications/europePMC.service";
import * as toastr from "toastr";

import { environment } from "src/environments/environment";
import { Select, Store } from "@ngxs/store";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { People, Publications, StudyAbstract, Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { AppComponent } from "src/app/app.component";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "app-meta",
  templateUrl: "./meta.component.html",
  styleUrls: ["./meta.component.css"],
})
export class MetaComponent implements OnInit {
  @select((state) => state.status.user) studyUser;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.title) studyTitle;
  @select((state) => state.study.abstract) studyDescription;


  @Select(UserState.user) user$: Observable<Owner>;
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(GeneralMetadataState.title) studyTitle$: Observable<string>;
  @Select(GeneralMetadataState.description) studyDescription$: Observable<string>;
  @Select(ApplicationState.toastrSettings) toastrSettings$: Observable<Record<string, any>>;


  requestedStudy: string = null;
  user: any = null;

  currentTitle: string = null;
  currentDescription: string = null;
  manuscript: any = null;
  manuscriptIdentifier = "";
  selectedManuscriptOption: number = null;
  isManuscriptLoading = false;
  manuscriptOptions: any[] = [
    {
      text: "Yes, Published",
      value: 1,
      disabled: false,
    },
    {
      text: "Yes, In Preparation",
      value: 2,
      disabled: false,
    },
    {
      text: "No",
      value: 3,
      disabled: false,
    },
  ];

  form: FormGroup;
  isLoading = false;
  baseHref: string;

  private toastrSettings: Record<string, any> = {};

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router,
    private doiService: DOIService,
    private europePMCService: EuropePMCService,
    private store: Store
  ) {
    this.editorService.initialiseStudy(this.route);
    this.setUpSubscriptionsNgxs();
    this.baseHref = this.editorService.configService.baseHref;
  }

  ngOnInit() {}


  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe(
      (value) => {
        this.toastrSettings = value;
        this.toastrSettings.timeOut = "3000"
      }
    )
    this.studyIdentifier$.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });
    this.studyTitle$.subscribe((value) => {
      if (value && value !== "") {
        this.currentTitle = value;
      }
    });
    this.studyDescription$.subscribe((value) => {
      if (value && value !== "") {
        this.currentDescription = value;
      }
    });
    this.user$.subscribe((value) => {
      this.user = value;
      this.user.checked = false;
    });

  }

  getCurrentStudyMetaData() {}

  manuscriptOptionChange() {
    this.manuscript = {};
    this.manuscript.title = "";
    this.manuscript.description = "";
    this.manuscript.authors = [];
  }
  fetchManuscriptInformation() {
    this.isManuscriptLoading = true;
    let manuscript = null;
    if (this.manuscriptIdentifier.indexOf(".") > 0) {
      manuscript = this.getArticleFromDOI();
    } else {
      manuscript = this.getArticleFromPubMedID();
    }
  }

  getArticleFromDOI() {
    const doi = this.manuscriptIdentifier
      .replace("http://dx.doi.org/", "")
      .replace(/^\s+|\s+$/g, "");
    const doiURL = "http://dx.doi.org/" + doi;
    if (doi !== "") {
      this.doiService.getArticleInfo(doiURL).subscribe((article) => {
        this.manuscript = article;
        this.europePMCService
          .getArticleInfo("DOI:" + doi.replace("http://dx.doi.org/", ""))
          .subscribe((art) => {
            if (art.doi === doi) {
              this.manuscript = article;
              this.isManuscriptLoading = false;
              this.includeAllAuthors();
            }
          });
      });
    }
  }

  getArticleFromPubMedID() {
    const pubMedID = this.manuscriptIdentifier;
    if (pubMedID !== "") {
      this.europePMCService
        .getArticleInfo("(SRC:MED AND EXT_ID:" + pubMedID + ")")
        .subscribe((article) => {
          this.manuscript = article;
          this.isManuscriptLoading = false;
          this.includeAllAuthors();
        });
    }
  }

  includeAllAuthors() {
    this.manuscript.authorDetails.forEach((author) => {
      author.checked = true;
    });
  }

  getFieldValue(name) {
    return this.form.get(name).value;
  }

  skipMetaData() {
    this.router.navigate(["/guide/assays", this.requestedStudy]);
  }
  

  saveMetadataNgxs() {
    this.isLoading = true;
    if (this.isManuscriptValid()) {
      this.store.dispatch(new Title.Update(this.manuscript.title)).subscribe(
        (completed) => {
          this.store.dispatch(new StudyAbstract.Update(this.manuscript.abstract)).subscribe(
            (completed) => {
              if (this.selectedManuscriptOption === 1) {
                this.store.dispatch(new Publications.Add(this.compilePublicationBody())).subscribe(
                  (completed) => {
                    const authorsA = [];
                    this.manuscript.authorDetails.forEach((author) => {
                      if (author.checked) {
                        this.manuscript.title = "";
                        this.manuscript.abstract = "";
                        this.isLoading = false;
                        this.manuscriptIdentifier = "";
                        this.selectedManuscriptOption = null;
                        authorsA.push(this.compileAuthor(author));
                      }
                    });
                    if (this.user.checked) {
                      authorsA.push(this.compileSubmitter(this.user));
                    }
                    this.store.dispatch(new People.Add({contacts: authorsA})).subscribe(
                      (completed) => {
                        this.isLoading = false;
                        this.manuscript.title = "";
                        this.manuscript.abstract = "";
                        this.isLoading = false;
                        this.manuscriptIdentifier = "";
                        this.selectedManuscriptOption = null;
                        this.router.navigate([
                          "/guide/assays",
                          this.requestedStudy,
                        ]);
                      },
                      (error) => {
                        console.log("Unable to save new person");
                        this.isLoading = false
                      }
                    )
                  },
                  (error) => {
                    console.log("Unable to save new publication");
                    this.isLoading = false;

                  }
                )
              } else {
                this.router.navigate(["/guides/assays", this.requestedStudy]);
              }
            },
            (error) => {
              console.log("Unable to save abstract of manuscript");
              this.isLoading = false;
            }
          )
        },
        (error) => {
          console.log("Unable to save title of manuscript.")
          this.isLoading = false;
        }
      )
    } else { // Manuscript is invalid
      this.isLoading = false;
      toastr.warning("Fields Missing", "Warning", this.toastrSettings)
    }
  }

  compilePublicationBody() {
    const mtblPublication = new MTBLSPublication();
    mtblPublication.title = this.manuscript.title;
    mtblPublication.authorList = this.manuscript.authorList;
    mtblPublication.doi = this.manuscript.doi;
    mtblPublication.pubMedID = this.manuscript.pubMedID;
    mtblPublication.comments = [];
    const jsonConvert: JsonConvert = new JsonConvert();
    mtblPublication.status = jsonConvert.deserializeObject(
      JSON.parse(
        '{"comments": [],"annotationValue": "Published","termSource": null' +
          ',"termAccession": "http://www.ebi.ac.uk/efo/EFO_0001796"}'
      ),
      Ontology
    );
    return { publication: mtblPublication.toJSON() };
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
        '{"annotationValue":"Author","comments":[],"termAccession":"http://' +
          'purl.obolibrary.org/obo/NCIT_C42781","termSource":{"comments":[],"d' +
          'escription":"NCI Thesaurus OBO Edition","file":"http://purl.obolibra' +
          'ry.org/obo/ncit.owl","ontology_name":"NCIT","provenance_name":"NCIT","version":"18.10e"}}'
      ),
      Ontology
    );
    mtblPerson.roles.push(role);
    return mtblPerson.toJSON();
  }

  compileSubmitter(author) {
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
        '{"annotationValue":"Submitter","comments":[],"termAccession":"http' +
          '://purl.obolibrary.org/obo/NCIT_C42781","termSource":{"comments":[]' +
          ',"description":"NCI Thesaurus OBO Edition","file":"http://purl.oboli' +
          'brary.org/obo/ncit.owl","ontology_name":"NCIT","provenance_name":"NCIT","version":"18.10e"}}'
      ),
      Ontology
    );
    mtblPerson.roles.push(role);
    return mtblPerson.toJSON();
  }

  setFieldValue(name, value) {
    return this.form.get(name).setValue(value);
  }

  isManuscriptValid() {
    if (this.manuscript.title !== "" && this.manuscript.abstract !== "") {
      return true;
    }
    return false;
  }
}

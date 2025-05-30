import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import { MTBLSPerson } from "./../../../models/mtbl/mtbls/mtbls-person";
import { Ontology } from "./../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../models/mtbl/mtbls/mtbls-publication";
import { JsonConvert } from "json2typescript";
import { DOIService } from "../../../services/publications/doi.service";
import { EuropePMCService } from "../../../services/publications/europePMC.service";
import * as toastr from "toastr";

import { Store } from "@ngxs/store";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { People, Publications, StudyAbstract, Title } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "app-meta",
  templateUrl: "./meta.component.html",
  styleUrls: ["./meta.component.css"],
})
export class MetaComponent implements OnInit {

  user$: Observable<Owner> = inject(Store).select(UserState.user);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyTitle$: Observable<string> = inject(Store).select(GeneralMetadataState.title);
  studyDescription$: Observable<string> = inject(Store).select(GeneralMetadataState.description);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  requestedStudy: string = null;
  user: any = null;

  currentTitle: string = null;
  currentDescription: string = null;

  manuscript: any = null;
  manuscriptIdentifier = "";
  selectedManuscriptOption: number = null;
  isManuscriptLoading = false;
  manuscriptIdentifierValidSyntax = true;
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

  manuscriptForm: UntypedFormGroup;
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

    this.manuscriptForm = this.fb.group({
      manuscriptID: ['', [manuscriptIDValidator()]]
    })
  }

  ngOnInit() { }


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

  getCurrentStudyMetaData() { }

  manuscriptOptionChange() {
    this.manuscript = {};
    this.manuscript.title = "";
    this.manuscript.description = "";
    this.manuscript.authors = [];
  }
  fetchManuscriptInformation() {
    this.isManuscriptLoading = true;
    let manuscript = null;
    //if (this.manuscriptIdentifier.indexOf(".") > 0) {
    if (isValidDOI(this.manuscriptIdentifier)) {
      this.manuscriptIdentifierValidSyntax = true;
      manuscript = this.getArticleFromDOI();
    } else if (isValidPubMedID(this.manuscriptIdentifier)) {
      this.manuscriptIdentifierValidSyntax = true;
      manuscript = this.getArticleFromPubMedID();
    } else {
      this.manuscriptIdentifierValidSyntax = false;
      this.isManuscriptLoading = false;

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
              //this.manuscript = article;
              this.manuscript = art;
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



  skipMetaData() {
    this.router.navigate(["/guide/assays", this.requestedStudy]);
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

}

export function manuscriptIDValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    if (isValidPubMedID(value) || isValidDOI(value)) {
      return null;
    }

    return { invalidManuscriptID: true };
  };
}

function isValidDOI(doi: string): boolean {
  const doiRegex = /^10.\d{4,9}\/[-._;()\/:A-Za-z0-9]+$/;

  return doiRegex.test(doi);
}

function isValidPubMedID(pmid: string | number): boolean {
  const pmidStr = pmid.toString();
  const pmidRegex = /^[1-9]\d*$/;
  return pmidRegex.test(pmidStr);
}
import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EditorService } from '../../../services/editor.service';
import { select } from '@angular-redux/store';
import { MTBLSPerson } from './../../../models/mtbl/mtbls/mtbls-person';
import { Ontology } from './../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from './../../../models/mtbl/mtbls/mtbls-publication';
import { JsonConvert } from 'json2typescript';
import { DOIService } from '../../../services/publications/doi.service';
import { EuropePMCService } from '../../../services/publications/europePMC.service';
import * as toastr from 'toastr';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-meta',
  templateUrl: './meta.component.html',
  styleUrls: ['./meta.component.css'],
})
export class MetaComponent implements OnInit {
  @select((state) => state.status.user) studyUser;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.title) studyTitle;
  @select((state) => state.study.abstract) studyDescription;

  @select((state) => state.study.studyDesignDescriptors)
  studyDesignDescriptors: any[];

  requestedStudy: string = null;
  user: any = null;

  currentTitle: string = null;
  currentDescription: string = null;
  manuscript: any = null;
  manuscriptIdentifier = '';
  selectedManuscriptOption: number = null;
  isManuscriptLoading = false;
  manuscriptOptions: any[] = [
    {
      text: 'Yes, Published',
      value: 1,
      disabled: false,
    },
    {
      text: 'Yes, In Preparation',
      value: 2,
      disabled: false,
    },
    {
      text: 'No',
      value: 3,
      disabled: false,
    },
  ];

  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router,
    private doiService: DOIService,
    private europePMCService: EuropePMCService
  ) {
    this.editorService.initialiseStudy(this.route);
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  ngOnInit() {}


  setUpSubscriptions() {
    this.studyIdentifier.subscribe((value) => {
      if (value !== null) {
        this.requestedStudy = value;
      }
    });
    this.studyTitle.subscribe((value) => {
      if (value && value !== '') {
        this.currentTitle = value;
      }
    });
    this.studyDescription.subscribe((value) => {
      if (value && value !== '') {
        this.currentDescription = value;
      }
    });
    this.studyUser.subscribe((value) => {
      this.user = value;
      this.user.checked = false;
    });
  }

  getCurrentStudyMetaData() {}

  manuscriptOptionChange() {
    this.manuscript = {};
    this.manuscript.title = '';
    this.manuscript.description = '';
    this.manuscript.authors = [];
  }
  fetchManuscriptInformation() {
    this.isManuscriptLoading = true;
    let manuscript = null;
    if (this.manuscriptIdentifier.indexOf('.') > 0) {
      manuscript = this.getArticleFromDOI();
    } else {
      manuscript = this.getArticleFromPubMedID();
    }
  }

  getArticleFromDOI() {
    const doi = this.manuscriptIdentifier
      .replace('http://dx.doi.org/', '')
      .replace(/^\s+|\s+$/g, '');
    const doiURL = 'http://dx.doi.org/' + doi;
    if (doi !== '') {
      this.doiService.getArticleInfo(doiURL).subscribe((article) => {
        this.manuscript = article;
        this.europePMCService
          .getArticleInfo('DOI:' + doi.replace('http://dx.doi.org/', ''))
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
    if (pubMedID !== '') {
      this.europePMCService
        .getArticleInfo('(SRC:MED AND EXT_ID:' + pubMedID + ')')
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
    this.router.navigate(['/guide/assays', this.requestedStudy]);
  }
  saveMetaData() {
    this.isLoading = true;
    if (this.isManuscriptValid()) {
      // Save title
      this.editorService.saveTitle({ title: this.manuscript.title }).subscribe(
        (res) => {
          // Save Abstract
          this.editorService
            .saveAbstract({ description: this.manuscript.abstract })
            .subscribe(
              (resp) => {
                // Save publication
                if (this.selectedManuscriptOption === 1) {
                  this.editorService
                    .savePublication(this.compilePublicationBody())
                    .subscribe(
                      (respo) => {
                        const authorsA = [];
                        this.manuscript.authorDetails.forEach((author) => {
                          if (author.checked) {
                            this.manuscript.title = '';
                            this.manuscript.abstract = '';
                            this.isLoading = false;
                            this.manuscriptIdentifier = '';
                            this.selectedManuscriptOption = null;
                            authorsA.push(this.compileAuthor(author));
                          }
                        });
                        if (this.user.checked) {
                          authorsA.push(this.compileSubmitter(this.user));
                        }
                        this.editorService
                          .savePerson({ contacts: authorsA })
                          .subscribe(
                            (respon) => {
                              this.isLoading = false;
                              this.manuscript.title = '';
                              this.manuscript.abstract = '';
                              this.isLoading = false;
                              this.manuscriptIdentifier = '';
                              this.selectedManuscriptOption = null;
                              this.router.navigate([
                                '/guide/assays',
                                this.requestedStudy,
                              ]);
                            },
                            (err) => {
                              this.isLoading = false;
                            }
                          );
                      },
                      (err) => {
                        this.isLoading = false;
                      }
                    );
                } else {
                  this.router.navigate(['/guide/assays', this.requestedStudy]);
                }
              },
              (err) => {
                this.isLoading = false;
              }
            );
        },
        (err) => {
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
      toastr.warning('Fields Missing', 'Warning', {
        timeOut: '3000',
        positionClass: 'toast-top-center',
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });
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
    mtblPerson.midInitials = '';
    mtblPerson.email = '';
    mtblPerson.phone = '';
    mtblPerson.fax = '';
    mtblPerson.address = '';
    mtblPerson.affiliation = author.affiliation ? author.affiliation : '';
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
    mtblPerson.midInitials = '';
    mtblPerson.email = '';
    mtblPerson.phone = '';
    mtblPerson.fax = '';
    mtblPerson.address = '';
    mtblPerson.affiliation = author.affiliation ? author.affiliation : '';
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
    if (this.manuscript.title !== '' && this.manuscript.abstract !== '') {
      return true;
    }
    return false;
  }
}

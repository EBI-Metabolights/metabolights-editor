import {
  Component,
  OnInit,
  Input,
  Output,
  Inject,
  OnChanges,
  SimpleChanges,
  ElementRef,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FormControl } from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { Observable } from "rxjs";
import {
  map,
  debounceTime,
  distinctUntilChanged,
  startWith,
} from "rxjs/operators";
import { EditorService } from "../../../services/editor.service";

import { Ontology } from "../../../models/mtbl/mtbls/common/mtbls-ontology";
import { OntologySourceReference } from "../../../models/mtbl/mtbls/common/mtbls-ontology-reference";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { ConfigurationService } from "src/app/configuration.service";
/* eslint-disable no-underscore-dangle */
@Component({
  selector: "mtbls-ontology",
  templateUrl: "./ontology.component.html",
  styleUrls: ["./ontology.component.css"],
})
export class OntologyComponent implements OnInit, OnChanges {
  @Input("validations") validations: any;
  @Input("values") values: Ontology[] = [];
  @Input("inline") isInline: boolean;
  @Input("controlListTerm") controlListTerm = false;
  @Input("id") id: string;

  @Output() changed = new EventEmitter<any>();

  @ViewChild("input", { read: MatAutocompleteTrigger })
  valueInput: MatAutocompleteTrigger;

  baseURL = "";
  loading = false;
  termsLoading = false;
  isforcedOntology = false;
  searchedMore = false;
  url = "";
  endPoints: any[] = [];
  addOnBlur = false;
  inputValue = "";
  form: FormGroup;
  isFormBusy = false;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  valueCtrl = new FormControl();
  filteredvalues: Observable<Ontology[]>;
  allvalues: Array<Ontology> = [];
  ontologyDetails: any = {};
  readonly = false;
  baseHref: string;

  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService
  ) {

  }

  join(path1: string, path2: string){

    if (path2.startsWith("/")){
      path2 = path2.slice(1);
    }
    if (path1.endsWith("/")){
      path1 = path1.slice(0,-1);
    }
    return path1 + "/" + path2;

  }

  ngOnInit() {
    this.baseHref = this.configService.baseHref;
    this.baseURL = this.configService.config.metabolightsWSURL.baseURL;
    if (this.baseURL.endsWith("/")){
      this.baseURL = this.baseURL.slice(0,-1);
    }
    if (this.values === null || this.values[0] === null) {
      this.values = [];
    }
    this.readonly = this.editorService.ngRedux.getState().study.readonly;


    this.getDefaultTerms();

    this.valueCtrl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(200))
      .subscribe(
        (value) => {
          if (value && value !== "") {
            this.inputValue = value;
            // this.allvalues = [];
            this.values = this.values.filter((el) => el !== null);

            if (this.values.length < 2) {
              let term = "";
              let ontologyFilter = null;
              try {
                if (typeof value === "string"){
                  if( value && value.indexOf(":") > -1) {
                    term = value.split(":")[1];
                    ontologyFilter = value.split(":")[0];
                  } else {
                    term = value;
                  }
                } else if ("annotationValue" in value) {
                  term = value.annotationValue;
                }
              } catch(err) {
                console.log(err);
              }

              this.termsLoading = false;
              this.searchedMore = false;
              this.loading = true;
              this.editorService
                .getOntologyTerms(this.baseURL + this.url + term)
                .subscribe((terms) => {
                  this.allvalues = [];
                  this.loading = false;
                  const jsonConvert: JsonConvert = new JsonConvert();
                  if (terms.OntologyTerm) {
                    terms.OntologyTerm.forEach((t) => {
                      const tempOntTerm = jsonConvert.deserializeObject(
                        t,
                        Ontology
                      );
                      if (ontologyFilter) {
                        if (tempOntTerm.termSource.name === ontologyFilter) {
                          this.allvalues.push(tempOntTerm);
                        }
                      } else {
                        this.allvalues.push(tempOntTerm);
                      }
                    });
                  }
                  this.fetchOntologyDetails();
                  this.filteredvalues = this.valueCtrl.valueChanges.pipe(
                    startWith(null),
                    map((val: Ontology | null) =>
                      val ? this._filter(val) : this.allvalues.slice()
                    )
                  );
                },
                (err) => {
                  console.log(err);
                  this.loading = false;
                }
                );
            }
          } else {
            this.inputValue = "";
            this.getDefaultTerms();
          }
        },
        (err) => console.error(err)
      );
  }

  getDefaultTerms() {
    if (this.readonly === false && "recommended-ontologies" in this.validations) {
      if (this.validations["recommended-ontologies"]) {
        this.isforcedOntology =
          this.validations["recommended-ontologies"]["is-forced-ontology"];
        this.url = this.validations["recommended-ontologies"].ontology.url;
        this.addOnBlur =
          this.validations["recommended-ontologies"].ontology.allowFreeText;
        this.endPoints = this.validations["recommended-ontologies"].ontology;
        if (this.url !== "") {
          this.editorService
            .getOntologyTerms(this.baseURL + this.url)
            .subscribe((terms) => {
              this.allvalues = [];
              if (terms.OntologyTerm) {
                const jsonConvert: JsonConvert = new JsonConvert();
                terms.OntologyTerm.forEach((term) => {
                  this.allvalues.push(
                    jsonConvert.deserializeObject(term, Ontology)
                  );
                });
              }
              this.fetchOntologyDetails();
              this.filteredvalues = this.valueCtrl.valueChanges.pipe(
                startWith(null),
                map((value: Ontology | null) =>
                  value ? this._filter(value) : this.allvalues.slice()
                )
              );
            });
        }
      }
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    this.values = this.values.filter((val) => val !== null);
  }

  setValues(values) {
    this.values = values;
  }

  optionSelected(selected: MatAutocompleteSelectedEvent) {
    if (selected.option.value !== null && selected.option.value !== undefined) {
      this.setValue(selected.option.value);
      const inputElement = document.getElementById("test") as HTMLInputElement;
      inputElement.value = "";
      this.triggerChanges();
    } else {
      this.retrieveMore();
      setTimeout(() => {
        this.valueInput.openPanel();
      });
    }
  }

  showMore(e, accession) {
    this.editorService
      .getOntologyTermDescription(
        "https://www.ebi.ac.uk/ols/api/ontologies/" +
          accession.termSource.name +
          "/terms/" +
          encodeURI(encodeURIComponent(accession.termAccession))
      )
      .subscribe(
        (response) => {
          accession.info = response;
        },
        (error) => {
          accession.info = "-";
        }
      );
  }

  getObjectKeys(ann) {
    return Object.keys(ann);
  }

  fetchOntologyDetails() {
    // this.allvalues.forEach((value) => {
    //   if (value.termSource.name !== "MTBLS") {
    //     if (!this.ontologyDetails[value.termAccession]) {
    //       this.editorService.getOntologyDetails(value).subscribe((detail) => {
    //         this.ontologyDetails[value.termAccession] = detail;
    //         if (detail) {
    //           const synonyms = detail.synonyms ? "Synonyms: " + detail.synonyms.join(", ") : "";
    //           value.annotationDefinition = detail.description ?  detail.description.join(". ") + synonyms : value.description + synonyms;
    //         }
    //       });
    //     } else {
    //       const detail = this.ontologyDetails[value.termAccession];
    //       if (detail) {
    //         const synonyms = detail.synonyms ? "Synonyms: " + detail.synonyms.join(", ") : "";
    //         value.annotationDefinition = detail.description ?  detail.description.join(". ") + synonyms : value.description + synonyms;
    //       }
    //     }
    //   }
    // });
  }

  retrieveMore() {
    this.termsLoading = true;
    this.allvalues = [];
    const term = this.inputValue;
    this.loading = true;
    this.editorService
      .getOntologyTerms(
          this.baseURL + this.url + term +
          "&queryFields={MTBLS,MTBLS_Zooma,Zooma,OLS,Bioportal}"
      )
      .subscribe((terms) => {
        this.allvalues = [];
        this.loading = false;
        const jsonConvert: JsonConvert = new JsonConvert();
        if (terms && "OntologyTerm" in terms){
          terms.OntologyTerm.forEach((ontTerm) => {
            this.allvalues.push(jsonConvert.deserializeObject(ontTerm, Ontology));
          });
          this.fetchOntologyDetails();
          this.termsLoading = false;
          this.searchedMore = true;
          this.filteredvalues = this.valueCtrl.valueChanges.pipe(
            startWith(null),
            map((value: Ontology | null) =>
              value ? this._filter(value) : this.allvalues.slice()
            )
          );
        }
      },
      (err) => {
        console.log(err);
        this.loading = false;
      });
  }

  indexOfObject(array, key, value): any {
    if (this.values && this.values.length > 0) {
      return array
        .filter((el) => el !== null)
        .map((e) => e[key])
        .indexOf(value);
    }
    return -1;
  }

  remove(value: Ontology): void {
    const index = this.indexOfObject(
      this.values,
      "annotationValue",
      value.annotationValue
    );
    if (index >= 0) {
      this.values.splice(index, 1);
    }
    if (this.values.length === 0) {
      this.getDefaultTerms();
    }
    this.triggerChanges();
  }

  add(event: MatChipInputEvent): void {
    if (this.addOnBlur) {
      const input = event.input;
      const value = event.value;
      if (event.value.replace(" ", "") !== "") {
        if (this.indexOfObject(this.values, "annotationValue", value) === -1) {
          const newOntology = new Ontology();
          newOntology.annotationValue = value.trim();
          newOntology.termAccession = "";
          newOntology.termSource = new OntologySourceReference();
          newOntology.termSource.description = "";
          newOntology.termSource.file = "";
          newOntology.termSource.name = "";
          newOntology.termSource.provenance_name = "";
          newOntology.termSource.version = "";
          this.setValue(newOntology);
        }
        const inputElement = document.getElementById(
          "test"
        ) as HTMLInputElement;
        inputElement.value = "";
        this.valueCtrl.setValue(null);
        this.getDefaultTerms();
        this.triggerChanges();
      }
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (
      this.indexOfObject(
        this.values,
        "annotationValue",
        event.option.value.annotationValue
      ) === -1
    ) {
      this.setValue(event.option.value);
    }
    this.valueCtrl.setValue(null);
    this.triggerChanges();
  }

  setValue(value) {
    let termExists = false;
    this.allvalues.forEach((val) => {
      if (typeof value === "string" || value instanceof String) {
        if (
          value &&
          val.annotationValue.toLowerCase() === value.toLowerCase()
        ) {
          termExists = true;
          this.values = [val];
        }
      } else {
        if (
          val.annotationValue &&
          value.annotationValue &&
          val.annotationValue.toLowerCase() ===
            value.annotationValue.toLowerCase()
        ) {
          termExists = true;
          this.values = [value];
        }
      }
    });
    if (!termExists) {
      this.values = [value];
    }
  }

  reset() {
    // this.inputValue = "";
    // this.allvalues = [];
    this.values = [];
    this.valueCtrl.setValue(null);
    // this.retrieveMore();
  }

  triggerChanges() {
    this.changed.emit(this.values);
  }

  private _filter(value: Ontology): Ontology[] {
    if (value && value.annotationValue) {
      const filterValue = value.annotationValue.toLowerCase();
      return this.allvalues.filter(
        (val) => val.annotationValue.toLowerCase().indexOf(filterValue) === 0
      );
    } else {
      return this.allvalues.slice();
    }
  }
}

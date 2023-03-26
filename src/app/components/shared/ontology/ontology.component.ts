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
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidateRules } from "./ontology.validator";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FormControl } from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { Observable, fromEvent } from "rxjs";
import {
  map,
  filter,
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchAll,
  tap,
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
  @Input("id") id: string;

  @Output() changed = new EventEmitter<any>();

  @ViewChild("input", { read: MatAutocompleteTrigger })
  valueInput: MatAutocompleteTrigger;

  wsDomain = "";
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

  ngOnInit() {
    this.baseHref = this.configService.baseHref;
    this.wsDomain = this.configService.config.metabolightsWSURL.domain;
    if (this.values === null || this.values[0] === null) {
      this.values = [];
    }
    this.readonly = this.editorService.ngRedux.getState().study.readonly;

    if (this.readonly === false && this.validations["data-type"] === "ontology") {
      if (this.validations["recommended-ontologies"]) {
        this.isforcedOntology =
          this.validations["recommended-ontologies"]["is-forced-ontology"];
        this.url = this.validations["recommended-ontologies"].ontology.url;
        this.addOnBlur =
          this.validations["recommended-ontologies"].ontology.allowFreeText;
        this.endPoints = this.validations["recommended-ontologies"].ontology;
        if (this.url !== "") {
          this.editorService
            .getOntologyTerms(this.wsDomain + this.url)
            .subscribe((terms) => {
              this.allvalues = [];
              const jsonConvert: JsonConvert = new JsonConvert();
              if (terms.OntologyTerm) {
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

    this.valueCtrl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe(
        (value) => {
          if (value && value !== "") {
            this.inputValue = value;
            this.allvalues = [];
            this.values = this.values.filter((el) => el !== null);

            if (this.values.length < 1) {
              let term = "";
              let ontologyFilter = null;
              if (value.indexOf(":") > -1) {
                term = value.split(":")[1];
                ontologyFilter = value.split(":")[0];
              } else {
                term = value;
              }
              this.termsLoading = false;
              this.searchedMore = false;
              this.loading = true;
              this.editorService
                .getOntologyTerms(this.wsDomain + this.url + term)
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
                });
            }
          }
        },
        (err) => console.error(err)
      );
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
    this.allvalues.forEach((value) => {
      if (value.termSource.name !== "MTBLS") {
        if (!this.ontologyDetails[value.termSource.name]) {
          this.editorService.getOntologyDetails(value).subscribe((details) => {
            this.ontologyDetails[value.termSource.name] = details;
            if (details.config) {
              value.termSource.version = details.config.version;
              value.termSource.description = details.config.title;
              value.termSource.file = details.config.id;
            }
          });
        } else {
          if (this.ontologyDetails[value.termSource.name].config) {
            value.termSource.version =
              this.ontologyDetails[value.termSource.name].config.version;
            value.termSource.description =
              this.ontologyDetails[value.termSource.name].config.title;
            value.termSource.file =
              this.ontologyDetails[value.termSource.name].config.id;
          }
        }
      }
    });
  }

  retrieveMore() {
    this.termsLoading = true;
    this.allvalues = [];
    const term = this.inputValue;
    this.loading = true;
    this.editorService
      .getOntologyTerms(
        this.wsDomain +
          this.url +
          term +
          "&queryFields=MTBLS,MTBLS_Zooma,Zooma,OLS,Bioportal}"
      )
      .subscribe((terms) => {
        this.allvalues = [];
        this.loading = false;
        const jsonConvert: JsonConvert = new JsonConvert();
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
          newOntology.termAccession =
            "http://www.ebi.ac.uk/metabolights/ontology/placeholder";
          newOntology.termSource = new OntologySourceReference();
          newOntology.termSource.description = "User defined terms";
          newOntology.termSource.file = "https://www.ebi.ac.uk/metabolights/";
          newOntology.termSource.name = "MTBLS";
          newOntology.termSource.provenance_name = "metabolights";
          newOntology.termSource.version = "1.0";
          this.setValue(newOntology);
        }
        const inputElement = document.getElementById(
          "test"
        ) as HTMLInputElement;
        inputElement.value = "";
        this.valueCtrl.setValue(null);
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
    this.inputValue = "";
    this.allvalues = [];
    this.valueCtrl.setValue(null);
    this.values = [];
    this.retrieveMore();
  }

  triggerChanges() {
    this.changed.emit(this.values);
  }

  private _filter(value: Ontology): Ontology[] {
    if (value.annotationValue) {
      const filterValue = value.annotationValue.toLowerCase();
      return this.allvalues.filter(
        (val) => val.annotationValue.toLowerCase().indexOf(filterValue) === 0
      );
    }
  }
}

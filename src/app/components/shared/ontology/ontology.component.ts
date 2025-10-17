import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { UntypedFormControl } from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { firstValueFrom, Observable } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { EditorService } from "../../../services/editor.service";
import { Store } from "@ngxs/store";

import { Ontology } from "../../../models/mtbl/mtbls/common/mtbls-ontology";
import { OntologySourceReference } from "../../../models/mtbl/mtbls/common/mtbls-ontology-reference";
import { JsonConvert } from "json2typescript";
import { ConfigurationService } from "src/app/configuration.service";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { OntologyComponentTrackerService } from "src/app/services/tracking/ontology-component-tracker.service";
/* eslint-disable no-underscore-dangle */
@Component({
    selector: "mtbls-ontology",
    templateUrl: "./ontology.component.html",
    styleUrls: ["./ontology.component.css"],
    animations: [
        trigger('fadeInOut', [
            state('in', style({ opacity: 1 })),
            state('out', style({ opacity: 0 })),
            transition('in => out', [animate('500ms ease-in-out')]),
            transition('out => in', [animate('500ms ease-in-out')]),
        ]),
    ],
    standalone: false
})
export class OntologyComponent implements OnInit, OnChanges {
  @Input("validations") validations: any;
  @Input("values") values: Ontology[] = [];
  @Input("inline") isInline: boolean;
  @Input("sourceValueType") sourceValueType = "ontology";
  @Input("initialSearchKeyword") initialSearchKeyword = "";
  @Input("controlList") controlList: {name: string; values: Ontology[]} = {name: '', values: []};
  @Input("id") id: string;
  @Input("unitId") unitId: string;
  @Input("label") label: string;

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
  form: UntypedFormGroup;
  isFormBusy = false;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  valueCtrl = new UntypedFormControl();
  filteredValuesObserver: Observable<Ontology[]>;
  currentOptions = [];
  allvalues: Array<Ontology> = [];
  ontologyDetails: any = {};
  readonly = false;
  baseHref: string;
  isRequired: boolean = false
  fadeState: 'in' | 'out' = 'out';


  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService,
    private store: Store,
    private ontTrackerService: OntologyComponentTrackerService
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

   async ngOnInit() {

    this.baseHref = this.configService.baseHref;
    this.baseURL = this.configService.config.metabolightsWSURL.baseURL;
    if (this.baseURL.endsWith("/")){
      this.baseURL = this.baseURL.slice(0,-1);
    }
    if (this.values === null || this.values[0] === null) {
      this.values = [];
    }
    this.url = "/ebi-internal/ontology?term=";
    this.readonly = await this.getReadonly();
    if (this.readonly === false && "recommended-ontologies" in this.validations) {
      if (this.validations["recommended-ontologies"]) {
        this.isforcedOntology =
          this.validations["recommended-ontologies"]["is-forced-ontology"];
        this.url = this.validations["recommended-ontologies"].ontology.url;
        this.addOnBlur =
          this.validations["recommended-ontologies"].ontology.allowFreeText;
        this.endPoints = this.validations["recommended-ontologies"].ontology;
      }
    }
    this.isRequired = this.validations["is-required"] == "true"
    this.isFormBusy = false;
    this.searchedMore = false;
    this.getDefaultTerms();

    this.valueCtrl.valueChanges.pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe( (value) => this.searchTerm(value, false));

    this.valueCtrl.setValue(this.initialSearchKeyword);
    if(this.initialSearchKeyword && this.initialSearchKeyword.length > 0){

      setTimeout(() => {
        this.valueInput.openPanel();
      });
    }
    this.ontTrackerService.register(this);

  }

  async getReadonly() {
    let result = await firstValueFrom(this.store.select(ApplicationState.readonly))
    return result
  }

  setCurrentOptions(values: Ontology[] = []) {

    this.currentOptions = values.filter((value) => {
      if (values) {
        let match = false;
        this.values.forEach((ontology) => {
          if (!match && ontology && ontology.annotationValue  && ontology.annotationValue === value.annotationValue
            && ontology.termAccession && ontology.termAccession === value.termAccession
            && ontology.termSource && ontology.termSource === value.termSource
            ) {
              match = true;
            }
        });
        if (match) {
          return false;
        }
      }
      return true;
    });
  }
  searchTerm(value: any, remoteSearch: boolean = false){
    if (value === null || value === undefined || value.length === 0) {
      this.setCurrentOptions(this.controlList.values);
      this.searchedMore = false;
      this.loading = false;
      return this.currentOptions;
    }
    this.inputValue = value;
    this.values = this.values.filter((el) => el !== null);
    let urlSuffix = "";
    if (remoteSearch){
      urlSuffix = "&queryFields={MTBLS,MTBLS_Zooma,Zooma,OLS,Bioportal}";
    }
    this.searchedMore = false;
    this.allvalues = [];
    if (value && value !== "") {
      if (this.values.length < 2) {
        let term = "";
        let ontologyFilter = null;

        try {
          if (typeof value === "string"){
            if (value.startsWith("http://")) value = value.replace("http://", "")
            if( value && value.indexOf(":") > -1) {
              term = encodeURI(value.split(":")[1]);
              ontologyFilter = value.split(":")[0];
            } else {
              term = encodeURI(value);
            }
          } else if ("annotationValue" in value) {
            term = encodeURI(value.annotationValue);
          }
        } catch(err) {
          console.log(err);
        }

        this.termsLoading = true;
        this.loading = true;
        this.isFormBusy = true;
        this.setCurrentOptions([]);
        this.editorService
          .getOntologyTerms(this.baseURL + this.url + term + urlSuffix)
          .subscribe((terms) => {
            this.allvalues = [];
            this.termsLoading = false;
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
            this.searchedMore = remoteSearch;
            this.isFormBusy = false;
            this.setCurrentOptions(this.allvalues);

          },
          (err) => {
            console.log(err);
            this.loading = false;
            this.termsLoading = false;
            this.searchedMore = false;
            this.isFormBusy = false;
          }
          );
      }
    } else {
      this.getDefaultTerms();
    }
  }
  getDefaultTerms() {
    if (!this.readonly && this.controlList && this.controlList.values !== null){
      this.allvalues = this.controlList.values;
      this.searchedMore = false;
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
      this.searchTerm(this.inputValue, true);
      setTimeout(() => {
        this.valueInput.openPanel();
      });
    }
  }

  showMore(e, accession) {
    this.termsLoading = true;
    this.editorService
      .getOntologyTermDescription(
        "https://www.ebi.ac.uk/ols4/api/ontologies/" +
          accession.termSource.name +
          "/terms/" +
          encodeURI(encodeURIComponent(accession.termAccession))
      )
      .subscribe(
        (response) => {
          accession.info = response;
          this.termsLoading = false;
        },
        (error) => {
          accession.info = "-";
          this.termsLoading = false;
        }
      );
  }

  getObjectKeys(ann) {
    return Object.keys(ann);
  }

  fetchOntologyDetails() {

  }

  retrieveMore() {

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
    if (this.values.length === 0 && !(this.inputValue && this.inputValue.length > 0)) {
      this.getDefaultTerms();
      this.valueCtrl.setValue("");
    }
    this.triggerChanges();
  }

  add(event: MatChipInputEvent): void {
    if (this.addOnBlur) {
      const input = event.chipInput;
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

    this.values = [];
    this.valueCtrl.setValue(null);
  }

  triggerChanges() {
    this.changed.emit(this.values);
  }

  copyText(ontologyTerm) {
    navigator.clipboard.writeText(ontologyTerm.annotationValue).then(() => {
      this.fadeInThenOut();
    })
  }

  fadeInThenOut() {
    this.fadeState = 'in';

    setTimeout(() => {
      this.fadeState = 'out';
    }, 2000);
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

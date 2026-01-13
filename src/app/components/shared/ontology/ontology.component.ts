import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { COMMA, ENTER, R } from "@angular/cdk/keycodes";
import { UntypedFormControl } from "@angular/forms";
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { firstValueFrom, Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, filter } from "rxjs/operators";
import { EditorService } from "../../../services/editor.service";
import { Store } from "@ngxs/store";

import { Ontology } from "../../../models/mtbl/mtbls/common/mtbls-ontology";
import { OntologySourceReference } from "../../../models/mtbl/mtbls/common/mtbls-ontology-reference";
import { JsonConvert } from "json2typescript";
import { ConfigurationService } from "src/app/configuration.service";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { OntologyComponentTrackerService } from "src/app/services/tracking/ontology-component-tracker.service";
import { FieldValueValidation } from "src/app/models/mtbl/mtbls/control-list";
/* eslint-disable no-underscore-dangle */
@Component({
  selector: "mtbls-ontology",
  templateUrl: "./ontology.component.html",
  styleUrls: ["./ontology.component.css"],
  animations: [
    trigger("fadeInOut", [
      state("in", style({ opacity: 1 })),
      state("out", style({ opacity: 0 })),
      transition("in => out", [animate("500ms ease-in-out")]),
      transition("out => in", [animate("500ms ease-in-out")]),
    ]),
  ],
})
export class OntologyComponent implements OnInit, OnChanges {
  @Input("validations") validations: any;
  @Input("values") values: Ontology[] = [];
  @Input("inline") isInline: boolean;
  @Input("sourceValueType") sourceValueType = "ontology";
  @Input("initialSearchKeyword") initialSearchKeyword = "";
  @Input() defaultOntologies: any;
  @Input("controlList") controlList: { name: string; values: Ontology[] } = {
    name: "",
    values: [],
  };
  @Input("id") id: string;
  @Input("unitId") unitId: string;
  @Input("label") label: string;
  @Input() rule: FieldValueValidation | null = null;
  @ViewChild('input', { static: false }) inputRef!: ElementRef<HTMLInputElement>;
  @Output() changed = new EventEmitter<any>();
  @Output() emptyError = new EventEmitter<boolean>();

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
  isRequired: boolean = false;
  fadeState: "in" | "out" = "out";

  constructor(
    private editorService: EditorService,
    private configService: ConfigurationService,
    private store: Store,
    private ontTrackerService: OntologyComponentTrackerService
  ) {}

  join(path1: string, path2: string) {
    if (path2.startsWith("/")) {
      path2 = path2.slice(1);
    }
    if (path1.endsWith("/")) {
      path1 = path1.slice(0, -1);
    }
    return path1 + "/" + path2;
  }

  async ngOnInit() {
    this.baseHref = this.configService.baseHref;
    this.baseURL = this.configService.config.metabolightsWSURL.baseURL;
    if (this.baseURL.endsWith("/")) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
    if (this.values === null || this.values[0] === null) {
      this.values = [];
    }
    this.url = "/ebi-internal/ontology?term=";
    this.readonly = await this.getReadonly();
    if (
      this.readonly === false &&
      "recommended-ontologies" in this.validations
    ) {
      if (this.validations["recommended-ontologies"]) {
        this.isforcedOntology =
          this.validations["recommended-ontologies"]["is-forced-ontology"];
        this.url = this.validations["recommended-ontologies"].ontology.url;
        this.addOnBlur =
          this.validations["recommended-ontologies"].ontology.allowFreeText;
        this.endPoints = this.validations["recommended-ontologies"].ontology;
      }
    }
    this.isRequired = this.validations["is-required"] == "true";
    this.isFormBusy = false;
    this.searchedMore = false;
    this.getDefaultTerms();
    
    // ensure defaults are visible immediately
    this.setCurrentOptions(this.allvalues);
    // retry a few times (short delay) until available.
    const subscribeToValueChanges = () => {
      if (!this.valueCtrl || !this.valueCtrl.valueChanges) {
        setTimeout(() => {
          if (!this.valueCtrl || !this.valueCtrl.valueChanges) {
            return;
          }
          subscribeToValueChanges();
        }, 50);
        return;
      }

      this.valueCtrl.valueChanges
        .pipe(distinctUntilChanged(), debounceTime(300))
        .subscribe((value) => {
          if (typeof value === "string") {
            this.searchTerm(value, false);
            return;
          }

          if (value === null || value === undefined || value === "") {
            this.getDefaultTerms();
            this.setCurrentOptions(this.allvalues);
            return;
          }

          try {
            if (value && typeof value === "object" && "annotationValue" in value) {              
              const v = value.annotationValue || "";
              if (!v || v.trim().length < 3) {
                this.getDefaultTerms();
                this.setCurrentOptions(this.allvalues);
              } else {
                // this.searchTerm(v, false);
              }
              return;
            }
          } catch (e) {
            // fall through
          }

          this.getDefaultTerms();
          this.setCurrentOptions(this.allvalues);
        });
    };

    subscribeToValueChanges();
    this.ontTrackerService.register(this);
  }

  async getReadonly() {
    let result = await firstValueFrom(
      this.store.select(ApplicationState.readonly)
    );
    return result;
  }

  setCurrentOptions(values: Ontology[] = []) {
    this.currentOptions = values.filter((value) => {
      if (values) {
        let match = false;
        this.values.forEach((ontology) => {
          if (
            !match &&
            ontology &&
            ontology.annotationValue &&
            ontology.annotationValue === value.annotationValue &&
            ontology.termAccession &&
            ontology.termAccession === value.termAccession &&
            ontology.termSource &&
            ontology.termSource === value.termSource
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
  searchTerm(value: any, remoteSearch: boolean = false) {
    
  if (value === null || value === undefined || (typeof value === "string" && value.trim().length < 3)) {
    this.getDefaultTerms();
    this.setCurrentOptions(this.allvalues);
    this.searchedMore = false;
    this.loading = false;
    this.isFormBusy = false;
    return this.currentOptions;
  }
  this.inputValue = value;
  this.values = this.values.filter((el) => el !== null);
  let urlSuffix = "";
  if (remoteSearch) {
    urlSuffix = "&queryFields={MTBLS,MTBLS_Zooma,Zooma,OLS,Bioportal}";
  }
  this.searchedMore = false;
  this.allvalues = [];
  if (value && value !== "") {
    if (this.values.length < 2) {
      let term = "";
      let ontologyFilter = null;

      try {
        if (typeof value === "string") {
          term = value;
        } else if ("annotationValue" in value) {
          term = value.annotationValue;
        }
      } catch (err) {
        console.log(err);
      }

      const initialTerms = this.controlList?.values || [];
      const matchingTerms = initialTerms.filter(t => 
        t.annotationValue.toLowerCase().includes(term.toLowerCase()) ||
        (t.termAccession && t.termAccession.toLowerCase().includes(term.toLowerCase()))
      );

      if (matchingTerms.length > 0) {
        this.allvalues = matchingTerms;
        this.searchedMore = remoteSearch;
        this.isFormBusy = false;
        this.setCurrentOptions(this.allvalues);
        return;
      }

      this.termsLoading = true;
      this.loading = true;
      this.isFormBusy = true;
      this.setCurrentOptions([]);
      this.termsLoading = true;

      this.allvalues = [];
      const ruleName = this.rule?.ruleName || this.defaultOntologies?.ruleName || "";
      const fieldName = this.rule?.fieldName || this.defaultOntologies?.fieldName || "";
      const isExactMatchRequired = false;
      if (
        this.rule &&
        (this.rule.validationType === "child-ontology-term" ||
          this.rule.validationType === "ontology-term-in-selected-ontologies" || this.rule.validationType === "any-ontology-term" || this.rule.validationType === "selected-ontology-term")
      ) {
        const validationType = this.rule.validationType;
        const ontologies = this.rule.ontologies || [];
        const allowedParentOntologyTerms =
          validationType === "child-ontology-term"
            ? this.rule.allowedParentOntologyTerms
            : undefined;

        this.editorService
          .searchOntologyTermsWithRuleV2(
            term,
            isExactMatchRequired,
            ruleName,
            fieldName,
            validationType,
            ontologies,
            allowedParentOntologyTerms
          )
          .subscribe(
            (response) => {
              this.allvalues = [];
              this.termsLoading = false;
              this.loading = false;
              if (response.content && response.content.result) {
                response.content.result.forEach((t) => {
                  // Manually create Ontology object to avoid JsonConvert issues with missing "comments"
                  const tempOntTerm = new Ontology();
                  tempOntTerm.annotationValue = t.term;
                  tempOntTerm.termAccession = t.termAccessionNumber;
                  tempOntTerm.annotationDefinition = t.description || "";
                  tempOntTerm.termSource = new OntologySourceReference();
                  tempOntTerm.termSource.name = t.termSourceRef;
                  tempOntTerm.termSource.description = t.description || "";
                  tempOntTerm.termSource.file = "";
                  tempOntTerm.termSource.version = "";
                  tempOntTerm.termSource.provenance_name = "";
                  tempOntTerm.comments = []; // Keep empty as requested

                  if (ontologyFilter) {
                    if (tempOntTerm.termSource.name === ontologyFilter) {
                      this.allvalues.push(tempOntTerm);
                    }
                  } else {
                    this.allvalues.push(tempOntTerm);
                  }
                });
              }
              this.searchedMore = remoteSearch;
              this.isFormBusy = false;
              this.setCurrentOptions(this.allvalues);
            },
            (err) => {
              console.error("New API error:", err);
              this.loading = false;
              this.termsLoading = false;
              this.searchedMore = false;
              this.isFormBusy = false;
            }
          );
      } else {
        this.editorService
          .searchOntologyTermsWithRuleV2(
            term,
            isExactMatchRequired,
            ruleName,
            fieldName,
            "any-ontology-term",
            this.defaultOntologies?.ontologies || [],
            null
          )
          .subscribe(
            (response) => {
              this.allvalues = [];
              this.termsLoading = false;
              this.loading = false;
              if (response.content && response.content.result) {
                response.content.result.forEach((t) => {
                  // Manually create Ontology object
                  const tempOntTerm = new Ontology();
                  tempOntTerm.annotationValue = t.term;
                  tempOntTerm.termAccession = t.termAccessionNumber;
                  tempOntTerm.annotationDefinition = t.description || "";
                  tempOntTerm.termSource = new OntologySourceReference();
                  tempOntTerm.termSource.name = t.termSourceRef;
                  tempOntTerm.termSource.description = t.description || "";
                  tempOntTerm.termSource.file = "";
                  tempOntTerm.termSource.version = "";
                  tempOntTerm.termSource.provenance_name = "";
                  tempOntTerm.comments = []; // Keep empty

                  if (ontologyFilter) {
                    if (tempOntTerm.termSource.name === ontologyFilter) {
                      this.allvalues.push(tempOntTerm);
                    }
                  } else {
                    this.allvalues.push(tempOntTerm);
                  }
                });
              }
              this.searchedMore = remoteSearch;
              this.isFormBusy = false;
              this.setCurrentOptions(this.allvalues);
            },
            (err) => {
              console.error("Legacy API error:", err);
              this.loading = false;
              this.termsLoading = false;
              this.searchedMore = false;
              this.isFormBusy = false;
            }
          );
      }
    }
  } else {
    this.getDefaultTerms();
  }
}

  getDefaultTerms() {
    if (this.readonly) return;

    // Prefer explicit rule.terms if provided (map to Ontology instances)
    if (this.rule && Array.isArray(this.rule.terms) && this.rule.terms.length > 0) {
      this.allvalues = this.rule.terms.map((t: any) => {
        const o = new Ontology();
        o.annotationValue = t.term || t.label || "";
        o.termAccession = t.termAccessionNumber || t.termAccession || "";
        o.termSource = new OntologySourceReference();
        o.termSource.name = t.termSourceRef || (t.termSource && t.termSource.name) || "";
        o.termSource.file = t.provenance_uri || "";
        o.termSource.provenance_name = t.provenance_name || "";
        o.comments = [];
        return o;
      });
      this.searchedMore = false;
      return;
    }

    // Fallback to controlList.values if available
    if (this.controlList && Array.isArray(this.controlList.values) && this.controlList.values.length > 0) {
      this.allvalues = this.controlList.values.slice();
      this.searchedMore = false;
      return;
    }

    // Final fallback: empty list
    this.allvalues = [];
    this.searchedMore = false;
  }

  ngOnChanges(changes: SimpleChanges) {
      this.values = this.values.filter((val) => val !== null);

      // Emit to parent when array becomes empty
      this.emptyError.emit(this.values.length === 0);
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

  retrieveMore() {}

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
  if (
    this.values.length === 0 
  ) {
    this.getDefaultTerms();
    this.valueCtrl.setValue("");
    this.setCurrentOptions(this.allvalues); 
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
        this.valueInput.closePanel();
        this.triggerChanges();
        // this.valueCtrl.enable();
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
    // this.valueCtrl.enable();
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
    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.value = '';
    }
    // this.valueCtrl.enable();
  }

  triggerChanges() {
    this.changed.emit(this.values);
  }

  copyText(ontologyTerm) {
    navigator.clipboard.writeText(ontologyTerm.annotationValue).then(() => {
      this.fadeInThenOut();
    });
  }

  fadeInThenOut() {
    this.fadeState = "in";

    setTimeout(() => {
      this.fadeState = "out";
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

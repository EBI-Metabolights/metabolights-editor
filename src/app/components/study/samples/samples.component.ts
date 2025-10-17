import { Component, ViewChild, ViewChildren, QueryList, inject, computed, effect, signal } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MTBLSFactor } from "./../../../models/mtbl/mtbls/mtbls-factor";
import { MTBLSColumn } from "./../../../models/mtbl/mtbls/common/mtbls-column";
import { MTBLSFactorValue } from "./../../../models/mtbl/mtbls/mtbls-factor-value";
import { OntologyComponent } from "../../shared/ontology/ontology.component";
import { TableComponent } from "./../../shared/table/table.component";
import { MTBLSCharacteristic } from "./../../../models/mtbl/mtbls/mtbls-characteristic";
import { Ontology } from "./../../../models/mtbl/mtbls/common/mtbls-ontology";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Store } from "@ngxs/store";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { filter, Observable, take, withLatestFrom } from "rxjs";
import { IStudyFiles, StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { FilesLists } from "src/app/ngxs-store/study/files/files.actions";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { OntologyComponentTrackerService } from "src/app/services/tracking/ontology-component-tracker.service";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
    selector: "mtbls-samples",
    templateUrl: "./samples.component.html",
    styleUrls: ["./samples.component.css"],
    animations: [
        trigger('fadeOut', [
            transition(':leave', [
                animate('300ms ease-out', style({ opacity: 0 }))
            ]),
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-in', style({ opacity: 1 }))
            ]),
        ])
    ],
    standalone: false
})
export class SamplesComponent  {

  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);
  rawFiles$: Observable<StudyFile[]> = inject(Store).select(FilesState.rawFiles);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  studySamples$: Observable<Record<string, any>> = inject(Store).select(SampleState.samples);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  studyFactors$: Observable<MTBLSFactor[]> = inject(Store).select(DescriptorsState.studyFactors);

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  actionStackFn = inject(Store).selectSignal(TransitionsState.actionStack);
  actionStack$ = computed(() => {
    const filterFn = this.actionStackFn();
    return filterFn('[samples]')
  });

  @ViewChild(TableComponent, { static: true }) sampleTable: TableComponent;
  @ViewChildren(OntologyComponent)
  private ontologyComponents: QueryList<OntologyComponent>;

  defaultCharacteristicControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultCharacteristicControlListName = "Characteristics";
  defaultUnitControlList: {name: string; values: any[]} = {name: "", values: []};
  defaultUnitControlListName = "unit";
  isReadOnly = false;

  selectedFactor: MTBLSFactor = null;
  isFactorDropdownActive = false;

  fileTypes: any = [
    {
      filter_name: "MetaboLights sample sheet type", // eslint-disable-line @typescript-eslint/naming-convention
      extensions: ["txt"],
    },
  ];

  samples: any = null;
  factors: any = null;
  validations: any = null;

  addColumnModalOpen = false;
  isAddSamplesModalOpen = false;
  addColumnType = null;
  showFactorComponent = true;

  emptySamplesExist = false;
  duplicateSamples: any = [];

  duplicateNames: any = [];
  rawFileNames: any = [];

  form: UntypedFormGroup;

  validationsId = "samples";

  actionStack = signal<string[]>([]);
  showRefreshPrompt = computed(() => this.actionStack().length > 0)
  debounceTimeout: any;


  constructor(
    private editorService: EditorService, 
    private fb: UntypedFormBuilder, 
    private store: Store,
    private ontTrackerService: OntologyComponentTrackerService
  ) {
    if (!this.defaultCharacteristicControlList) {
      this.defaultCharacteristicControlList = {name: "", values: []};
    }
    if (!this.defaultUnitControlList) {
      this.defaultUnitControlList = {name: "", values: []};
    }
    this.setUpSubscriptionsNgxs();
  }

  onChanges($event) {

  }

  setUpSubscriptionsNgxs() {
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyFactors$.subscribe((value) => {
      this.factors = value;
    });
    this.studyIdentifier$.pipe(filter(val => val !== null)).subscribe(val => {
      //
    });
    this.studyFiles$.pipe(withLatestFrom(this.studyIdentifier$)).subscribe(([f, studyIdentifierValue]) => {
      if (f) {
        this.store.dispatch(new FilesLists.GetRawFiles(studyIdentifierValue));
      }
    });
    this.studySamples$.pipe(withLatestFrom(this.studyIdentifier$))
      .subscribe(([value, studyIdentifierValue]) => {
        if (value === null) {
          this.editorService.loadStudySamples(studyIdentifierValue); // currently causing an issue
        } else {
          this.samples = value;
        }
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
    this.rawFiles$.pipe(filter(val => val !== null)).subscribe((val) => {
      this.rawFileNames = val.filter(file => file.type == 'raw').map(file => file.file.split(".")[0]);
    });

    effect(() => {
      const intermediateList = this.actionStack$();
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout= setTimeout(() => {
        this.actionStack.set(intermediateList);
      }, 500);
    });
  }

  getParticularFileObject(listOfFiles: StudyFile[], name: string): StudyFile {
    const result = listOfFiles.find(file => file.file === name)
    return result
  }

  refresh() {
    this.parseSamples();
  }

  parseSamples() {
    const uniqueSamples = [];
    this.duplicateSamples = [];
    this.emptySamplesExist = false;
    if (this.sampleTable.data) {
      this.sampleTable.data.rows.forEach((row) => {
        const sampleName = row["Sample Name"];
        if (uniqueSamples.indexOf(sampleName) > -1) {
          this.duplicateSamples.push(sampleName);
        } else {
          uniqueSamples.push(sampleName);
        }
        if (sampleName === "") {
          this.emptySamplesExist = true;
        }
      });
    }
  }

  get unSelectedFactors() {
    const uniqueSelectedFactors = [];
    if (this.factors) {
      const usf: any = [];
      if (!this.sampleTable) {
        return usf;
      }
      if (this.sampleTable.data && this.sampleTable.data.header) {
        this.keys(this.sampleTable.data.header).forEach((header) => {
          if (header.indexOf("Factor Value") > -1) {
            const factorName = header
              .replace("Factor Value", "")
              .replace("[", "")
              .replace("]", "")
              .replace(/^[ ]+|[ ]+$/g, "");
            if (uniqueSelectedFactors.indexOf(factorName) < 0) {
              uniqueSelectedFactors.push(factorName);
            }
          }
        });
      }
      this.factors.forEach((f) => {
        if (uniqueSelectedFactors.indexOf(f.factorName) < 0) {
          usf.push(f);
        }
      });
    }
    return [];
  }

  addSamples() {
    const samples = this.form
      .get("samples")
      .value.replace(/,/g, "\n")
      .split("\n");
    const sRows = [];
    samples.forEach((s) => {
      const existingSamples = this.sampleTable.data.rows.map(
        (r) => r["Sample Name"]
      );
      if (existingSamples.indexOf(s) < 0) {
        const emptyRow = this.sampleTable.getEmptyRow();
        emptyRow["Source Name"] = s + "";
        emptyRow["Sample Name"] = s;
        emptyRow["Protocol REF"] = "Sample collection";
        sRows.push(emptyRow);
      }
    });

    this.sampleTable.addRows(sRows, null);
    this.closeAddSamplesModal();
  }

  importFileNamesFromRawData() {
    this.duplicateNames = [];
    const sampleNames = this.sampleTable.data.rows.map((r) => r["Sample Name"]);
    this.rawFileNames.forEach((rName) => {
      if (sampleNames.indexOf(rName) > -1) {
        this.duplicateNames.push(rName);
      }
    });
    this.form.get("samples").setValue(this.rawFileNames.join("\n"));
  }

  handleIncl(type, $event: {factor: MTBLSFactor, unitId: string}) {
    // this event will contain the factor and the factor unit, potentially in the 
    // same object, i don't know 
    // addColumn makes use of a viewChild via getOntologyComponentValue to get the factor unit
    // we won't be able to do that here, as the ontology unit is quite far down
    // UNLESS we tell the viewchildren to go deep in looking for children
    this.addColumn(type, $event.factor, true, $event.unitId);
  }

  addColumn(type, selectedFactor?: MTBLSFactor, deepUnit: boolean = false, unitId: string = null) {
    if (type === "factor") {
      const mtblsFactorValue = new MTBLSFactorValue();
      if (selectedFactor) mtblsFactorValue.category = selectedFactor
      else mtblsFactorValue.category = this.selectedFactor; // TODO: change

      const columns = [];

      const newFactorIndex = this.keys(this.sampleTable.data.header).length;
      const factorValueColumn = new MTBLSColumn(
        "Factor Value[" + mtblsFactorValue.category.factorName + "]",
        "",
        newFactorIndex
      );
      let factorUnitValue
      if (deepUnit) factorUnitValue = this.ontTrackerService.getById('factorUnit', unitId).values[0];
      else {
        if (this.getOntologyComponentValue("factorUnit") !== undefined) {
          factorUnitValue = this.getOntologyComponentValue("factorUnit").values[0];
        }

      } 

      let factorUnitColumn;
      let factorSourceColumn;
      let factorAccessionColumn;

      if (
        factorUnitValue &&
        factorUnitValue !== null &&
        factorUnitValue.annotationValue !== ""
      ) {
        factorSourceColumn = new MTBLSColumn("Unit", "", newFactorIndex + 1);
        factorSourceColumn.value = factorUnitValue.annotationValue;
        factorAccessionColumn = new MTBLSColumn(
          "Term Source REF",
          "",
          newFactorIndex + 2
        );
        factorAccessionColumn.value = factorUnitValue.termSource.name
        factorUnitColumn = new MTBLSColumn(
          "Term Accession Number",
          "",
          newFactorIndex + 3
        );
        factorUnitColumn.value = factorUnitValue.termAccession
      } else {
        factorSourceColumn = new MTBLSColumn(
          "Term Source REF",
          "",
          newFactorIndex + 1
        );
        factorAccessionColumn = new MTBLSColumn(
          "Term Accession Number",
          "",
          newFactorIndex + 2
        );
      }
      if (factorUnitColumn !== undefined) columns.push(factorUnitColumn.toJSON());
      columns.push(factorValueColumn.toJSON());
      columns.push(factorSourceColumn.toJSON());
      columns.push(factorAccessionColumn.toJSON());

      this.sampleTable.addColumns(columns);
      this.refreshFactorComponent();

      this.toggleDropdown();
    } else {
      const mtblsCharacteristic = new MTBLSCharacteristic();
      mtblsCharacteristic.category = this.getOntologyComponentValue(
        "characteristicCategory"
      ).values[0];
      mtblsCharacteristic.value = new Ontology();

      let characteristicsCount = 0;
      this.keys(this.sampleTable.data.header).forEach((key) => {
        if (key.indexOf("Characteristics") > -1) {
          characteristicsCount = characteristicsCount + 1;
        }
      });

      const protocolRefIndex = this.sampleTable.data.header["Protocol REF"];

      const columns = [];
      const characteristicsColumn = new MTBLSColumn(
        "Characteristics[" + mtblsCharacteristic.category.annotationValue + "]",
        "",
        protocolRefIndex
      );
      const characteristicsSourceColumn = new MTBLSColumn(
        "Term Source REF",
        "",
        protocolRefIndex + 1
      );
      const characteristicsAccessionColumn = new MTBLSColumn(
        "Term Accession Number",
        "",
        protocolRefIndex + 2
      );
      columns.push(characteristicsColumn.toJSON());
      columns.push(characteristicsSourceColumn.toJSON());
      columns.push(characteristicsAccessionColumn.toJSON());
      this.sampleTable.addColumns(columns);
      this.refreshFactorComponent();
    }
    this.closeAddColumnModal();
  }

  openAddColumnModal(type, selection) {
    if (type === "factor") {
      this.selectedFactor = selection;
    }

    if (type === "characteristic") {
      this.selectedFactor = null;
    }

    //this.addColumnModalOpen = true;
    this.addColumnType = type;

    this.form = this.fb.group({
      title: [""],
      samples: [],
    });
    this.addColumn(type, selection)
  }

  openAddSamplesModal() {
    this.isAddSamplesModalOpen = true;
    this.form = this.fb.group({
      samples: [],
    });
  }

  closeAddColumnModal() {
    this.addColumnModalOpen = false;
    this.selectedFactor = null;
  }

  // factor component never derendered from sample table so we want to make sure 
  // it is not holding any stale data.
  refreshFactorComponent() {
    this.showFactorComponent = false;
    setTimeout(() => this.showFactorComponent = true, 0)
  }

  closeAddSamplesModal() {
    this.isAddSamplesModalOpen = false;
  }

  toggleDropdown() {
    this.isFactorDropdownActive = !this.isFactorDropdownActive;
  }

  keys(object) {
    return Object.keys(object);
  }

  getOntologyComponentValue(id) {
    return this.ontologyComponents.filter(
      (component) => component.id === id
    )[0];
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
  controlList(name: string) {
    let controlList = this.defaultCharacteristicControlList;
    let controlListName = this.defaultCharacteristicControlListName;
    if(name === "unit") {
      controlList = this.defaultUnitControlList;
      controlListName = this.defaultUnitControlListName;
    }
    if (!(controlList && controlList.name.length > 0)
      && this.editorService.defaultControlLists && controlListName in this.editorService.defaultControlLists){
        controlList.values = this.editorService.defaultControlLists[controlListName].OntologyTerm;
        controlList.name = controlListName;
    }
    return controlList;
  }
  refreshSamplesTableWithoutPopup() {
    this.studySamples$
      .pipe(withLatestFrom(this.studyIdentifier$), take(1))
      .subscribe(([, studyIdentifierValue]) => {
        this.editorService.loadStudySamplesWithoutPopup(studyIdentifierValue);
    });
  }
}

import { Component, ViewChild, ViewChildren, QueryList, OnChanges } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MTBLSFactor } from "./../../../models/mtbl/mtbls/mtbls-factor";
import { MTBLSColumn } from "./../../../models/mtbl/mtbls/common/mtbls-column";
import { MTBLSFactorValue } from "./../../../models/mtbl/mtbls/mtbls-factor-value";
import { OntologyComponent } from "../../shared/ontology/ontology.component";
import { TableComponent } from "./../../shared/table/table.component";
import { MTBLSCharacteristic } from "./../../../models/mtbl/mtbls/mtbls-characteristic";
import { Ontology } from "./../../../models/mtbl/mtbls/common/mtbls-ontology";
import { environment } from "src/environments/environment";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Select } from "@ngxs/store";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Observable } from "rxjs";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";

@Component({
  selector: "mtbls-samples",
  templateUrl: "./samples.component.html",
  styleUrls: ["./samples.component.css"],
})
export class SamplesComponent  {

  @Select(FilesState.files) studyFiles$: Observable<IStudyFiles>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(SampleState.samples) studySamples$: Observable<Record<string, any>>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  @Select(DescriptorsState.studyFactors) studyFactors$: Observable<MTBLSFactor>;


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

  emptySamplesExist = false;
  duplicateSamples: any = [];

  duplicateNames: any = [];
  rawFileNames: any = [];

  form: FormGroup;

  validationsId = "samples";


  constructor(private editorService: EditorService, private fb: FormBuilder) {
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
    this.studyFiles$.subscribe((f) => {
      if (f) {
        f.study.forEach((file) => {
          if (file.type === "raw") {
            const name = file.file.split(".")[0];
            this.rawFileNames.push(name);
          }
        });
      }
    });
    this.studySamples$.subscribe((value) => {
      if (value === null) {
        this.editorService.loadStudySamples();
      } else {
        this.samples = value;
      }
    });
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
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

  addColumn(type) {
    if (type === "factor") {
      const mtblsFactorValue = new MTBLSFactorValue();
      mtblsFactorValue.category = this.selectedFactor;
      const columns = [];
      console.log(this.sampleTable);
      const newFactorIndex = this.keys(this.sampleTable.data.header).length;
      const factorValueColumn = new MTBLSColumn(
        "Factor Value[" + mtblsFactorValue.category.factorName + "]",
        "",
        newFactorIndex
      );
      const factorUnitValue =
        this.getOntologyComponentValue("factorUnit").values[0];

      let factorUnitColumn;
      let factorSourceColumn;
      let factorAccessionColumn;

      if (
        factorUnitValue &&
        factorUnitValue !== null &&
        factorUnitValue.annotationValue !== ""
      ) {
        factorUnitColumn = new MTBLSColumn("Unit", "", newFactorIndex + 1);
        factorUnitColumn.value = factorUnitValue.annotationValue;
        factorSourceColumn = new MTBLSColumn(
          "Term Source REF",
          "",
          newFactorIndex + 2
        );
        factorAccessionColumn = new MTBLSColumn(
          "Term Accession Number",
          "",
          newFactorIndex + 3
        );
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
      columns.push(factorValueColumn.toJSON());
      if (factorUnitColumn !== undefined) {
        columns.push(factorUnitColumn.toJSON());
      }
      columns.push(factorSourceColumn.toJSON());
      columns.push(factorAccessionColumn.toJSON());

      this.sampleTable.addColumns(columns);

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

    this.addColumnModalOpen = true;
    this.addColumnType = type;

    this.form = this.fb.group({
      title: [""],
      samples: [],
    });
  }

  openAddSamplesModal() {
    this.isAddSamplesModalOpen = true;
    this.form = this.fb.group({
      samples: [],
    });
  }

  closeAddColumnModal() {
    this.addColumnModalOpen = false;
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
}

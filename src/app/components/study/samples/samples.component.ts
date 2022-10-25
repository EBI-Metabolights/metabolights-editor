import { Component, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { select } from "@angular-redux/store";
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

@Component({
  selector: "mtbls-samples",
  templateUrl: "./samples.component.html",
  styleUrls: ["./samples.component.css"],
})
export class SamplesComponent {
  @select((state) => state.study.samples) studySamples;
  @select((state) => state.study.validations) studyValidations: any;
  @select((state) => state.study.factors) studyFactors;
  @select((state) => state.study.files) studyFiles: any;

  @select((state) => state.study.readonly) readonly;
  isReadOnly: boolean = false;

  @ViewChildren(OntologyComponent)
  private ontologyComponents: QueryList<OntologyComponent>;
  @ViewChild(TableComponent, { static: true }) sampleTable: TableComponent;

  selectedFactor: MTBLSFactor = null;
  isFactorDropdownActive: boolean = false;

  fileTypes: any = [
    {
      filter_name: "MetaboLights sample sheet type",
      extensions: ["txt"],
    },
  ];

  samples: any = null;
  factors: any = null;
  validations: any = null;

  addColumnModalOpen: boolean = false;
  isAddSamplesModalOpen: boolean = false;
  addColumnType = null;

  emptySamplesExist: boolean = false;
  duplicateSamples: any = [];

  duplicateNames: any = [];
  rawFileNames: any = [];

  form: FormGroup;

  validationsId = "samples";

  constructor(private editorService: EditorService, private fb: FormBuilder) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyValidations.subscribe((value) => {
      this.validations = value;
    });
    this.studyFactors.subscribe((value) => {
      this.factors = value;
    });
    this.studyFiles.subscribe((f) => {
      if (f) {
        f.study.forEach((file) => {
          if (file.type == "raw") {
            let name = file.file.split(".")[0];
            this.rawFileNames.push(name);
          }
        });
      }
    });
    this.studySamples.subscribe((value) => {
      if (value == null) {
        this.editorService.loadStudySamples();
      } else {
        this.samples = value;
      }
    });
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  refresh() {
    this.parseSamples();
  }

  parseSamples() {
    let uniqueSamples = [];
    this.duplicateSamples = [];
    this.emptySamplesExist = false;
    if (this.sampleTable.data) {
      this.sampleTable.data.rows.forEach((row) => {
        let sampleName = row["Sample Name"];
        if (uniqueSamples.indexOf(sampleName) > -1) {
          this.duplicateSamples.push(sampleName);
        } else {
          uniqueSamples.push(sampleName);
        }
        if (sampleName == "") {
          this.emptySamplesExist = true;
        }
      });
    }
  }

  get unSelectedFactors() {
    let uniqueSelectedFactors = [];
    if (this.factors) {
      let usf: any = [];
      if (!this.sampleTable) {
        return usf;
      }
      if (this.sampleTable.data && this.sampleTable.data.header) {
        this.keys(this.sampleTable.data.header).forEach((header) => {
          if (header.indexOf("Factor Value") > -1) {
            let factorName = header
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
    let samples = this.form
      .get("samples")
      .value.replace(/,/g, "\n")
      .split("\n");
    let sRows = [];
    samples.forEach((s) => {
      let existingSamples = this.sampleTable.data.rows.map(
        (r) => r["Sample Name"]
      );
      if (existingSamples.indexOf(s) < 0) {
        let emptyRow = this.sampleTable.getEmptyRow();
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
    let sampleNames = this.sampleTable.data.rows.map((r) => r["Sample Name"]);
    this.rawFileNames.forEach((rName) => {
      if (sampleNames.indexOf(rName) > -1) {
        this.duplicateNames.push(rName);
      }
    });
    this.form.get("samples").setValue(this.rawFileNames.join("\n"));
  }

  addColumn(type) {
    if (type == "factor") {
      let mtblsFactorValue = new MTBLSFactorValue();
      mtblsFactorValue.category = this.selectedFactor;
      let columns = [];
      let newFactorIndex = this.keys(this.sampleTable.data.header).length;
      let factorValueColumn = new MTBLSColumn(
        "Factor Value[" + mtblsFactorValue.category.factorName + "]",
        "",
        newFactorIndex
      );
      let factorUnitValue =
        this.getOntologyComponentValue("factorUnit").values[0];

      let factorUnitColumn;
      let factorSourceColumn;
      let factorAccessionColumn;

      if (
        factorUnitValue &&
        factorUnitValue != null &&
        factorUnitValue.annotationValue != ""
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
      if (factorUnitColumn != null) {
        columns.push(factorUnitColumn.toJSON());
      }
      columns.push(factorSourceColumn.toJSON());
      columns.push(factorAccessionColumn.toJSON());

      this.sampleTable.addColumns(columns);

      this.toggleDropdown();
    } else {
      let mtblsCharacteristic = new MTBLSCharacteristic();
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

      let protocolRefIndex = this.sampleTable.data.header["Protocol REF"];

      let columns = [];
      let characteristicsColumn = new MTBLSColumn(
        "Characteristics[" + mtblsCharacteristic.category.annotationValue + "]",
        "",
        protocolRefIndex
      );
      let characteristicsSourceColumn = new MTBLSColumn(
        "Term Source REF",
        "",
        protocolRefIndex + 1
      );
      let characteristicsAccessionColumn = new MTBLSColumn(
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
    if (type == "factor") {
      this.selectedFactor = selection;
    }

    if (type == "characteristic") {
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
    return this.ontologyComponents.filter((component) => {
      return component.id === id;
    })[0];
  }

  get validation() {
    if (this.validationsId.includes(".")) {
      var arr = this.validationsId.split(".");
      let tempValidations = JSON.parse(JSON.stringify(this.validations));
      while (arr.length && (tempValidations = tempValidations[arr.shift()]));
      return tempValidations;
    }
    return this.validations[this.validationsId];
  }

  fieldValidation(fieldId) {
    return this.validation[fieldId];
  }
}

import { AfterContentInit, Component, inject, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { EditorService } from "../../../../services/editor.service";
import { TableComponent } from "./../../../shared/table/table.component";
import { MAFState } from "src/app/ngxs-store/study/maf/maf.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { deepCopy } from "src/app/ngxs-store/utils";

@Component({
  selector: "mtbls-maf",
  templateUrl: "./maf.component.html",
  styleUrls: ["./maf.component.css"],
})
export class MafComponent implements AfterContentInit {
  @Input("value") value: any;

  @ViewChild(TableComponent) mafTable: TableComponent;

  studyMAFs$: Observable<Record<string, any>> = inject(Store).select(MAFState.mafs);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  

  isReadOnly = false;

  currentID = null;

  mafData: any = null;
  currentRow = 0;
  isAutoPopulateModalOpen = false;
  isRowEditModalOpen = false;
  isFormBusy = false;
  selectedRow = {};
  form: UntypedFormGroup;
  currentIndex = 0;

  rowsToUpdate = [];
  inProgress = true;

  isAutoPopulating = false;

  fileTypes: any = [
    {
      filter_name: "MetaboLights maf sheet type", //eslint-disable-line @typescript-eslint/naming-convention
      extensions: ["tsv"],
    },
  ];

  constructor(private fb: UntypedFormBuilder, private editorService: EditorService) {}

  ngAfterContentInit() {
    this.loadNgxs();
  }


  loadNgxs() {
    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
    this.studyMAFs$.subscribe((mafs) => {
      if(Array.isArray(mafs) && mafs.length === 0){
        return;
      }
      if (mafs && this.value.data.file) {
        this.mafData = mafs[this.value.data.file];
      }
    });
  }

  openRowEditModal(row) {
    this.isRowEditModalOpen = true;
    this.selectedRow = row;
    this.form = this.fb.group({
      name: [row.metabolite_identification],
      smiles: [row.smiles],
      inchi: [row.inchi],
      databaseId: [row.database_identifier],
      formula: [row.chemical_formula],
    });
  }

  validateMAFSheet() {
    this.loadNgxs();
  }

  getChebiId() {
    const dbId = this.form.get("databaseId").value;
    if (dbId && dbId !== "") {
      if (dbId.toLowerCase().indexOf("chebi") > -1) {
        this.currentID = dbId.split(":")[1];
      }
    } else {
      this.currentID = null;
    }
  }

  nextRow() {
    if (this.currentRow < this.mafTable.data.rows.length) {
      this.currentRow = this.currentRow + 1;
      this.loadAutoPopulateField(this.currentRow);
    }
  }

  previousRow() {
    if (this.currentRow > 0) {
      this.currentRow = this.currentRow - 1;
      this.loadAutoPopulateField(this.currentRow);
    }
  }

  loadAutoPopulateField(i) {
    const row = this.mafTable.data.rows[i];
    this.selectedRow = row;
    this.form = this.fb.group({
      name: [row.metabolite_identification],
      smiles: [row.smiles],
      inchi: [row.inchi],
      databaseId: [row.database_identifier],
      formula: [row.chemical_formula],
    });
    this.getChebiId();
  }

  autoPopulate(manual) {
    if (manual) {
      this.openAutoPopulateModal();
      this.loadAutoPopulateField(this.currentRow);
    } else {
      const promises = [];
      this.isAutoPopulating = true;
      this.mafData.data.rows.forEach((row) => {
        const dbIdentifier = row.database_identifier;
        const smiles = row.smiles;
        const inchi = row.inchi;
        const name = row.metabolite_identification;

        if (name && name !== "") {
          const promise = this.getCompound(name, "name");
          promises.push(promise);
        } else {
          if (dbIdentifier && dbIdentifier !== "") {
            const promise = this.getCompound(dbIdentifier, "databaseid");
            promises.push(promise);
          } else {
            if (smiles && smiles !== "") {
              const promise = this.getCompound(smiles, "smiles");
              promises.push(promise);
            } else {
              if (inchi && inchi !== "") {
                const promise = this.getCompound(inchi, "inchi");
                promises.push(promise);
              }
            }
          }
        }
      });

      Promise.all(promises).then((data) => {
        data.forEach((d) => {
          if (d) {
            this.mafData.data.rows.forEach((row) => {
              if(row === undefined) return;
              if (d.content[0] === undefined) return;
              if (
                row.database_identifier === d.content[0].databaseId ||
                row.smiles === d.content[0].smiles ||
                row.inchi === d.content[0].inchi ||
                row.metabolite_identification === d.content[0].name
              ) {
                const details = d.content[0];
                if (details) {
                  if (this.isEmpty(row.database_identifier)) {
                    row.database_identifier = details.databaseId;
                  }
                  if (this.isEmpty(row.chemical_formula)) {
                    row.chemical_formula = details.formula;
                  }
                  if (this.isEmpty(row.inchi)) {
                    row.inchi = details.inchi;
                  }
                  if (this.isEmpty(row.metabolite_identification)) {
                    row.metabolite_identification = details.name;
                  }
                  if (this.isEmpty(row.smiles)) {
                    row.smiles = details.smiles;
                  }
                }
                this.rowsToUpdate.push(row);
              }
            });
          }
        });
        this.mafTable.updateRows(this.rowsToUpdate);
      });
    }
  }

  isEmpty(val) {
    return !val && val === "" ? true : false;
  }

  async getCompound(id, type) {
    return await this.editorService.search(id, type).toPromise();
  }

  openAutoPopulateModal() {
    this.isAutoPopulateModalOpen = true;
  }

  closeAutoPopulateModal() {
    this.isAutoPopulateModalOpen = false;
  }

  search(type) {
    const term = this.form.get(type).value;
    this.isFormBusy = true;
    this.editorService.search(term, type.toLowerCase()).subscribe(
      (res) => {
        const resultObj = res.content[0];
        this.isFormBusy = false;
        const fields = ["name", "smiles", "inchi", "formula", "databaseId"];
        fields.forEach((field) => {
          if (field !== term) {
            if (field === "name") {
              if (this.form.get(field).value === "") {
                this.form
                  .get(field)
                  .setValue(resultObj[field], { emitEvent: false });
              }
            } else {
              this.form
                .get(field)
                .setValue(resultObj[field], { emitEvent: false });
            }
          }
        });
        this.getChebiId();
        this.form.markAsDirty();
      },
      (err) => {
        this.isFormBusy = false;
        this.form.markAsDirty();
      }
    );
  }

  /* there are lots of instances like this where the original author is tricking typescript
   * into working like javascript. A purist would correct all of it, but I am only
   * one man */
  /* eslint-disable @typescript-eslint/dot-notation */
  saveCell() {
    let copyRow = deepCopy(this.selectedRow);
    copyRow["metabolite_identification"] = this.form.get("name").value;
    copyRow["inchi"] = this.form.get("inchi").value;
    copyRow["database_identifier"] = this.form.get("databaseId").value;
    copyRow["smiles"] = this.form.get("smiles").value;
    copyRow["chemical_formula"] = this.form.get("formula").value;
    this.mafTable.updateRows([copyRow]);
  }

  closeRowEditModal() {
    this.isRowEditModalOpen = false;
  }
}

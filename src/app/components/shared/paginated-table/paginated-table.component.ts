import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  Input,
  QueryList,
  SimpleChanges,
  Output,
  EventEmitter,
  AfterViewChecked,
  OnChanges,
  AfterViewInit,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { OntologySourceReference } from "../../../models/mtbl/mtbls/common/mtbls-ontology-reference";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Ontology } from "../../../models/mtbl/mtbls/common/mtbls-ontology";
import { EditorService } from "../../../services/editor.service";
import { OntologyComponent } from "../ontology/ontology.component";
import { NgRedux, select } from "@angular-redux/store";
import { ClipboardService } from "ngx-clipboard";
import * as toastr from "toastr";
import { tassign } from "tassign";
import { environment } from "src/environments/environment";
import { ServerDataSource } from "./paginated-table.datasource";
import { IsaTableDataSourceService } from "src/app/services/remote.datasource.service";
import { tap } from "rxjs/operators";
import { PaginatedTableColumn, PaginatedTableMetadata } from "src/app/models/mtbl/mtbls/paginated-table";

/* eslint-disable @typescript-eslint/dot-notation */
@Component({
  selector: "mtbls-paginated-table",
  templateUrl: "./paginated-table.component.html",
  styleUrls: ["./paginated-table.component.css"],
})
export class PaginatedTableComponent implements OnInit, AfterViewInit, AfterViewChecked, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @Input("tableData") tableData: any;
  @Input("columnNames") columnNames: string[] = null;
  @Input("validationsId") validationsId: any;
  @Input("enableControlList") enableControlList = false;
  @Input("structureColumnEnabled") structureColumnEnabled = false;

  @ViewChildren(OntologyComponent)
  ontologyComponents: QueryList<OntologyComponent>;
  @select((state) => state.study.validations) studyValidations: any;
  @select((state) => state.study.files) studyFiles: any;

  @Output() updated = new EventEmitter<any>();
  @Output() rowsUpdated = new EventEmitter<any>();
  @Output() rowEdit = new EventEmitter<any>();

  @select((state) => state.study.readonly) readonly;
  @select((state) => state.study.identifier) studyIdentifier;

  @Input("fileTypes") fileTypes: any = [
    {
      filter_name: "All types", // eslint-disable-line
      extensions: ["*"],
    },
  ];

  dataSource: ServerDataSource;
  currentMetadata: PaginatedTableMetadata;
  currentMetadataRowIndices = new Map<number, number>();
  currentMetadataColumnIndices = new Map<number, number>();
  currentMetadataColumnNameIndices = new Map<string, number>();

  currentPage: any[];
  rowsToAdd: any = 1;
  isReadOnly = true;

  validations: any = {};
  mlPageSizeOptions: any = [50, 100, 500, 1000];

  // dataSource: MatTableDataSource<any>;
  data: any = null;
  files: any = null;

  loading = false;

  selectedRows: any[] = [];
  selectedColumns: any[] = [];
  selectedCells: any[] = [];

  selectedCell = {};

  lastRowSelection = null;
  lastColSelection = null;

  displayedTableColumns: any = [];

  ontologyCols: any = {};
  fileColumns: any = [];
  controlListColumns: Map<string, any> = new Map<string, any>();
  controlListNames: Map<string, string> = new Map<string, string>();
  controlLists: Map<string, {name: string; values: Ontology[]}> = new Map<string, {name: string; values: Ontology[]}>();
  ontologyColumns: any = [];
  isFormBusy = false;
  isCellTypeFile = false;
  isCellTypeOntology = false;
  isCellTypeControlList = false;
  selectedCellOntology: Ontology = null;
  selectedOntologyCell: any = null;

  selectedColumn = null;
  selectedColumnValues = null;

  filter = "";
  filters: string[] = [];

  view = "compact";
  isEditModalOpen = false;
  isEditColumnModalOpen = false;
  isDeleteModalOpen = false;
  editCellform: FormGroup;
  editColumnform: FormGroup;
  defaultControlList = Object.freeze({name: "", values: Object.freeze([])});
  selectedMissingCol = null;
  selectedMissingKey = null;
  selectedMissingVal = null;
  isEditColumnMissingModalOpen = false;
  assayTechnique: {name: string; sub: string; main: string} = {name: null, sub:null, main:null};
  stableColumns: any = ["Protocol REF", "Metabolite Assignment File"];
  ontologies = [];
  hit = false;
  baseHref: string;
  studyId: string;
  constructor(
    private clipboardService: ClipboardService,
    private fb: FormBuilder,
    private editorService: EditorService,
    private isaTableDataSourceService: IsaTableDataSourceService
  ) {
    this.baseHref =this.editorService.configService.baseHref;
  }

  ngOnInit() {
    this.structureColumnEnabled = true;
    this.dataSource = new ServerDataSource(this.isaTableDataSourceService);
    this.studyIdentifier.subscribe((val) => {
      this.studyId = val;
    });
    this.dataSource.data.subscribe((val: any) => {
      this.currentMetadataRowIndices.clear();
      if(val && this.structureColumnEnabled) {
        this.currentPage = val.map((col) => {
          col.structure = "";
          return col;
        });
      } else {
        this.currentPage = val;
      }
      if (this.currentPage) {
        this.currentPage.forEach((element, idx) => {
        this.currentMetadataRowIndices.set(element.index, idx);
      });
      }

    });
    this.dataSource.metadata.subscribe((val) => {
      this.currentMetadataColumnIndices.clear();
      this.currentMetadataColumnNameIndices.clear();
      if(val && this.structureColumnEnabled) {
        val.columnNames = ["structure"].concat(val.columnNames);
        const structureColumn = new PaginatedTableColumn();
        structureColumn.columnDef = "structure";
        structureColumn.header = "structure";
        structureColumn.sticky = "true";
        structureColumn.calculated = true;
        val.columns = [structureColumn].concat(val.columns);
        this.currentMetadata = val;
      } else {
        this.currentMetadata = val;
      }
      if(val) {
        this.currentMetadata.columns.forEach((element, idx) => {
          this.currentMetadataColumnIndices.set(element.targetColumnIndex, idx);
          this.currentMetadataColumnNameIndices.set(element.columnDef, element.targetColumnIndex);
        });
      }

    });

    this.dataSource.loadIsaTableRows(this.studyId, this.tableData.data.file, '', 'asc', 0, 50, this.columnNames);
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }
  ngAfterViewInit() {

    this.paginator.page
        .pipe(
            tap(() => this.loadIsaTablePage())
        )
        .subscribe();

}

loadIsaTablePage() {
    this.dataSource.loadIsaTableRows(
        this.studyId,
        this.tableData.data.file,
        '',
        '',
        this.paginator.pageIndex,
        this.paginator.pageSize,
        this.columnNames);
}

  setUpSubscriptions() {
    this.studyValidations.subscribe((value) => {
      this.validations = value;
    });
    this.studyFiles.subscribe((value) => {
      if (value) {
        this.files = value.study;
      }
    });
    this.readonly.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
  }

  getFiles(header) {
    // if(this.fileColumns.indexOf(header) > -1){
    // 	if(this.data.header[header]){
    // 		let type = this.data.header[header]['file-type']
    // 		return this.files.filter(file => {
    // 			return file.type === type
    // 		})
    // 	}
    // }
    return this.files;
  }

  getControlList(header) {
    if(this.controlListColumns.has(header)){

    }
    return [];
  }

  initialise() {
    this.deSelect();
    // this.data = this.tableData.data;
    if (this.data) {
      this.hit = true;
      // this.displayedTableColumns = this.data.displayedColumns;
      // this.dataSource = new MatTableDataSource<any>(this.data.rows);
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.filterPredicate = (data, filter) =>
        // this.getDataString(data).indexOf(filter.toLowerCase()) > -1;
      // this.dataSource.sort = this.sort;
      this.detectFileColumns();
      this.validateTableOntologyColumns();
      if (this.view === "expanded") {
        this.displayedTableColumns = Object.keys(this.data.header);
      }
    }
  }

  ngAfterViewChecked() {
    // setTimeout(() => {
    //   if (this.dataSource && !this.paginator) {
    //     if (this.dataSource.filteredData.length > 500) {
    //       this.paginator.pageSizeOptions = [
    //         50,
    //         100,
    //         500,
    //         this.dataSource.filteredData.length,
    //       ];
    //       this.paginator.pageSize = 50;
    //     } else {
    //       // this is what is throwing the ExpressionChangedAfterItHasBeenCheckedError
    //       this.paginator.pageSizeOptions = [
    //         10,
    //         100,
    //         this.dataSource.filteredData.length,
    //       ];
    //       this.paginator.pageSize = this.dataSource.filteredData.length;
    //     }
    //     this.dataSource.paginator = this.paginator;
    //   }
    // });
  }

  onCopy(e) {
    this.copyCellContent(e);
  }

  onCut(e) {
    this.cutCellContent(e);
  }

  onPaste(e) {
    this.savePastedCellContent(e, null);
  }

  onClick(e) {
    let allClasses = [];
    e.path.forEach((ele) => {
      if (ele && ele.classList) {
        allClasses = allClasses.concat(ele.classList.value.split(" "));
      }
    });
    if (allClasses.indexOf("prevent-deselect") < 0) {
      this.deSelect();
    }
    e.stopPropagation();
  }

  cutCellContent(e) {
    this.copyCellContent(e);
    this.savePastedCellContent(e, "");
  }

  copyCellContent(e) {
    let content = "";
    this.selectedCells = this.selectedCells.sort((a, b) => a[1] - b[1]);
    if (this.selectedCells.length > 0 || this.selectedColumns.length > 0) {
      if (this.selectedCells.length > 0) {
        let i = 0;
        this.selectedCells.forEach((cell) => {
          i = i + 1;
          if (i < this.selectedCells.length) {
            content = content + this.currentPage[cell[1]][cell[0]] + "\n";
          } else {
            content = content + this.currentPage[cell[1]][cell[0]];
          }
        });
      } else if (this.selectedColumns.length > 0) {
        if (this.selectedColumns.length === 1) {
          let i = 0;
          this.currentPage.forEach((row) => {
            i = i + 1;
            if (i < this.currentPage.length) {
              content = content + row[this.selectedColumns[0]] + "\n";
            } else {
              content = content + row[this.selectedColumns[0]];
            }
          });
        }
      }
      const navigator = window.navigator;
      navigator.clipboard.writeText(content).then(
        () => {},
        (err) => {
          console.error("Async: Could not copy text: ", err);
        }
      );
    }
  }

  getHeaderIndex(columnIndex) {
    if (this.isObject(columnIndex)) {
      if (columnIndex.index !== null) {
        columnIndex = columnIndex.targetColumnIndex;
      }
    }
    return columnIndex;
  }

  isChEBIId(id) {
    if (id && id !== "") {
      if (id.toLowerCase().indexOf("chebi") > -1) {
        return true;
      }
    }
    return false;
  }

  savePastedCellContent(e, pvalue) {
    this.loading = true;
    const cellsToUpdate = [];
    if (!this.isEditModalOpen) {
      if (this.selectedCells.length === 1) {
        const clipboardData = e.clipboardData
          ? e.clipboardData
          : (window as any).clipboardData;
        const pastedValues = clipboardData.getData("Text").split(/\r\n|\n|\r/);
        let currentRow = this.selectedCells[0][1];
        pastedValues.forEach((value) => {
          const targetColIdx = this.currentMetadataColumnNameIndices.get(this.selectedCells[0][0]);
          const targetRowIdx = this.currentMetadataRowIndices.get(this.currentPage[currentRow].index);
          if (currentRow < this.currentPage.length) {
            cellsToUpdate.push({
              row: targetRowIdx,
              column: targetColIdx,
              value: pvalue ? pvalue : value,
            });
            currentRow = currentRow + 1;
          }
        });
      } else {
        if (
          this.selectedCells.length === 0 &&
          this.selectedColumns.length > 0 &&
          this.selectedRows.length === 0
        ) {
          const clipboardData = e.clipboardData
            ? e.clipboardData
            : (window as any).clipboardData;
          const pastedValues = clipboardData
            .getData("Text")
            .split(/\r\n|\n|\r/);
          if (pastedValues.length === 1) {
            let currentRow = 0;
            pastedValues.forEach((value) => {
              const targetColIdx = this.currentMetadataColumnNameIndices.get(this.selectedColumns[0]);
              const targetRowIdx = this.currentMetadataRowIndices.get(this.currentPage[currentRow].index);
              if (currentRow < this.currentPage.length) {
                cellsToUpdate.push({
                  row: targetRowIdx,
                  column: targetColIdx,
                  value: pvalue ? pvalue : this.selectedColumns[0],
                });
                currentRow = currentRow + 1;
              }
            });
          } else {
            let currentRow = 0;
            pastedValues.forEach((value) => {
              const targetColIdx = this.currentMetadataColumnNameIndices.get(this.selectedColumns[0]);
              const targetRowIdx = this.currentMetadataRowIndices.get(this.currentPage[currentRow].index);
              if (currentRow < this.currentPage.length) {
                cellsToUpdate.push({
                  row: targetRowIdx,
                  column: targetColIdx,
                  value: pvalue ? pvalue : value,
                });
                currentRow = currentRow + 1;
              }
            });
          }
        } else if (this.selectedCells.length > 0) {
          const clipboardData = e.clipboardData;
          const pastedValue = clipboardData
            .getData("Text")
            .split(/\r\n|\n|\r/)[0];
          let currentRow = 0;
          this.selectedCells.forEach((value) => {
            const targetColIdx = this.currentMetadataColumnNameIndices.get(this.selectedCells[0][0]);
            const targetRowIdx = this.currentMetadataRowIndices.get(this.currentPage[currentRow].index);
            if (currentRow < this.currentPage.length) {
              cellsToUpdate.push({
                row: targetRowIdx,
                column: targetColIdx,
                value: pvalue ? pvalue : value,
              });
              currentRow = currentRow + 1;
            }
          });
        }
      }
    }

    if (cellsToUpdate.length > 0) {
      this.isFormBusy = true;
      this.editorService
        .updateMAFTableCells(
          this.currentMetadata.file,
          { data: cellsToUpdate }
        )
        .subscribe(
          (res) => {
            toastr.success("Cells updated successfully", "Success", {
              timeOut: "2500",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            });
            this.loading = false;
            this.isFormBusy = false;
            this.updateTableData(cellsToUpdate);
          },
          (err) => {
            console.error(err);
            this.loading = false;
            this.isFormBusy = false;
          }
        );
    }
  }

  detectFileColumns() {
    Object.keys(this.data.header).forEach((col) => {
      if (
        this.data.header[col]["data-type"] === "file" ||
        col.toLowerCase().indexOf("file") > -1
      ) {
        if (this.fileColumns.indexOf(col) === -1) {
          this.fileColumns.push(col);
        }
      }
    });
  }

  detectControlListColumns() {
    Object.keys(this.data.header).forEach((col) => {
      if (!this.controlListColumns.has(col)) {
        const formattedColumnName = col.replace(/\.[0-9]+$/, "");
        const definition = this.getValidationDefinition(formattedColumnName);
        if (definition
          && "ontology-details" in definition
          && "recommended-ontologies" in definition["ontology-details"]
          && definition["ontology-details"]["recommended-ontologies"]) {
            const prefix = definition["ontology-details"]["recommended-ontologies"].ontology?.url;
            let branch = "";
            const branchParam = prefix.split("branch=");
            if (branchParam.length > 1) {
              branch = decodeURI(branchParam[1].split("&")[0]);
            }
            if (branch.length > 0) {
              this.controlListNames.set(col, branch);
              this.controlListColumns.set(col, Object.freeze(definition));
            }
        }
      }
    });
  }

  toggleView() {
    if (this.view === "compact") {
      this.displayedTableColumns = Object.keys(this.data.header);
      this.view = "expanded";
    } else {
      this.displayedTableColumns = this.data.displayedColumns;
      this.view = "compact";
    }
  }

  validateTableOntologyColumns() {
    this.ontologyCols = {};
    const tableHeader = this.data.header;
    const columns = Object.keys(tableHeader).sort(
      (a, b) => tableHeader[a] - tableHeader[b]
    );
    let count = 0;
    columns.forEach((val) => {
      if (count + 2 < columns.length) {
        const currentColumn = val;
        if (
          columns[count + 1].indexOf("Term Source REF") > -1 &&
          columns[count + 2].indexOf("Term Accession Number") > -1
        ) {
          this.ontologyCols[currentColumn] = {
            ref: columns[count + 1],
            accession: columns[count + 2],
          };
        }
      }
      count = count + 1;
    });
    Object.keys(this.ontologyCols).forEach((column) => {
      if (this.ontologyColumns.indexOf(column) === -1) {
        this.ontologyColumns.push(column);
      }
      this.ontologyCols[column].values = {};
      this.ontologyCols[column].missingTerms = new Set<string>();
      this.currentPage.forEach((row) => {
        if (
          !this.isEmpty(row[column]) &&
          (this.isEmpty(row[this.ontologyCols[column].ref]) ||
            this.isEmpty(row[this.ontologyCols[column].accession]))
        ) {
          this.ontologyCols[column].missingTerms.add(row[column]);
        }
        if (!this.isEmpty(row[column])) {
          if (!this.ontologyCols[column].values[row[column]]) {
            if (row[column].replace(" ", "") !== "") {
              this.ontologyCols[column].values[row[column]] = [null, null];
            }
            if (
              !this.isEmpty(row[this.ontologyCols[column].ref]) &&
              !this.isEmpty(row[this.ontologyCols[column].accession])
            ) {
              this.ontologyCols[column].values[row[column]] = [
                row[this.ontologyCols[column].ref],
                row[this.ontologyCols[column].accession],
              ];
            }
          } else {
            if (
              !this.isEmpty(row[this.ontologyCols[column].ref]) &&
              !this.isEmpty(row[this.ontologyCols[column].accession])
            ) {
              this.ontologyCols[column].values[row[column]] = [
                row[this.ontologyCols[column].ref],
                row[this.ontologyCols[column].accession],
              ];
            }
          }
        }
      });
    });
  }

  hasAnyMissingValues() {
    let hasMV = false;
    Object.keys(this.ontologyCols).forEach((key) => {
      if (this.ontologyCols[key].missingTerms.size > 0) {
        hasMV = true;
      }
    });
    return hasMV;
  }

  getDef(column) {
    return column.columnDef;
  }

  applyFilter(filterValue: string) {
    // this.dataSource.data = this.tableData.data.rows;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onKeydown(event, filterValue: string) {
    // let data = [];
    if (event.key === "Enter") {
      // if (this.filters.indexOf(filterValue) < 0) {
      //   this.filters.push(filterValue);
      //   event.target.value = "";
      // }
      // this.dataSource.filter = "";
      // this.filters.forEach((f) => {
      //   data = data.concat(
      //     this.dataSource.data.filter(
      //       (d) =>
      //         this.getDataString(d).toLowerCase().indexOf(f.toLowerCase()) > -1
      //     )
      //   );
      // });
      // this.dataSource.data = data;
    }
  }

  formatHeader(term) {
    const s = term
      .replace(/_/g, " ")
      .replace(/\.[^/.]+$/, "")
      .replace(/\[/g, " - ")
      .replace(/\]/g, "")
      .replace("Characteristics - ", " ")
      .replace("Factor Value -", "");
    if (s === "smiles") {
      return "SMILES";
    } else if (s === "inchi") {
      return "InChI";
    }
    return s;
  }

  getDataString(row) {
    let rowString = "";
    Object.keys(row).forEach(
      (prop) => (rowString = rowString + " " + row[prop])
    );
    return rowString.toLowerCase();
  }

  removeFilter(filter) {
    // this.filters = this.filters.filter((e) => e !== filter);
    // this.dataSource.filter = "";
    // if (this.filters.length > 0) {
    //   let data = [];
    //   this.filters.forEach((f) => {
    //     data = data.concat(
    //       this.dataSource.data.filter(
    //         (d) => this.getDataString(d).indexOf(f.toLowerCase()) > -1
    //       )
    //     );
    //   });
    //   this.dataSource.data = data;
    // } else {
    //   this.dataSource.data = this.data.data.rows;
    // }
  }

  addColumns(columns) {
    this.isFormBusy = true;
    this.editorService
      .addColumns(this.data.file, { data: columns }, this.validationsId, null)
      .subscribe(
        (res) => {
          toastr.success("Characteristic/Factor columns are added successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.isFormBusy = false;
          return true;
        },
        (err) => {
          console.log(err);
          this.isFormBusy = false;
          return false;
        }
      );
  }

  addNRows() {
    if (this.rowsToAdd > 0) {
      let index = this.currentPage.length;
      if (this.selectedRows.length > 0) {
        index = this.selectedRows[0] + 1;
      }
      const rows = [];
      const emptyRow = this.getEmptyRow();
      for (let i = 0; i < this.rowsToAdd; i += 1) {
        rows[i] = emptyRow;
      }
      this.rowsToAdd = 1;
      this.addRows(rows, index);
    }
  }

  addRow() {
    let index = this.currentPage.length;
    if (this.selectedRows.length > 0) {
      index = this.selectedRows[0];
    }
    this.addRows([this.getEmptyRow()], index);
  }

  updateRows(rows) {
    this.isFormBusy = true;
    this.editorService
      .updateRows(this.data.file, { data: rows }, this.validationsId, null)
      .subscribe(
        (res) => {
          toastr.success("Row updated successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.isFormBusy = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
  }

  addRows(rows, index) {
    this.isFormBusy = true;
    this.editorService
      .addRows(
        this.data.file,
        { data: { rows, index: index ? index : 0 } },
        this.validationsId,
        null
      )
      .subscribe(
        (res) => {
          toastr.success(
            "Rows added successfully to the end of the sheet",
            "Success",
            {
              timeOut: "2500",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            }
          );
          this.rowsUpdated.emit();
          this.isFormBusy = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
  }

  getEmptyRow() {
    if (this.currentPage.length > 0) {
      const obj = tassign({}, this.currentPage[0]);
      Object.keys(obj).forEach((key) => {
        let isStableColumn = false;
        this.stableColumns.forEach((col) => {
          if (key.indexOf(col) > -1) {
            isStableColumn = true;
          }
        });
        if (!isStableColumn) {
          obj[key] = "";
        }
      });
      return obj;
    } else {
      const obj = tassign({}, this.data.header);
      Object.keys(obj).forEach((key) => {
        obj[key] = "";
      });
      return obj;
    }
  }

  deleteSelectedRows() {
    this.isFormBusy = true;
    this.editorService
      .deleteRows(
        this.data.file,
        this.getUnique(this.selectedRows).join(","),
        this.validationsId,
        null
      )
      .subscribe(
        (res) => {
          this.isDeleteModalOpen = false;
          toastr.success("Rows delete successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.rowsUpdated.emit();
          this.isFormBusy = false;
        },
        (err) => {
          this.isFormBusy = false;
        }
      );
  }

  closeDelete() {
    this.isDeleteModalOpen = false;
  }

  openDeleteModal() {
    this.isDeleteModalOpen = true;
  }

  openEditMissingColValModal(smc, key, val) {
    this.selectedMissingCol = smc;
    this.selectedMissingKey = key;
    this.selectedMissingVal = val;
    this.isEditColumnMissingModalOpen = true;
    if (this.enableControlList && this.controlListColumns.size === 0
      && this.validations && this.validation && this.data && this.data.header) {
      this.detectControlListColumns();
    }
  }

  closeEditMissingColValModal() {
    this.selectedMissingCol = null;
    this.selectedMissingKey = null;
    this.selectedMissingVal = null;
    this.isEditColumnMissingModalOpen = false;
  }

  highlightFilteredRows(term) {
    // this.selectedRows = this.selectedRows.concat(
    //   this.dataSource.data
    //     .filter((f) => this.getDataString(f).indexOf(term.toLowerCase()) !== -1)
    //     .map((p) => p.index)
    // );
  }

  isSelected(row, column, rowIdx) {
    if (row && column && this.selectedCells.length > 0) {
      return (
        this.selectedCells.filter(
          (cell) => cell[0] === column.columnDef && cell[1] === row.index
        ).length > 0
      );
    } else if (this.selectedColumns.length === 0) {
      if (this.selectedRows.indexOf(row.index) > -1) {
        return true;
      }
    } else if (this.selectedRows.length === 0) {
      if (this.selectedColumns.indexOf(column.columnDef) > -1) {
        return true;
      }
    }
    return false;
  }

  deSelect() {
    this.selectedRows = [];
    this.selectedColumns = [];
    this.selectedCells = [];
  }

  headerClick(column: any, event) {
    this.selectedCells = [];
    this.selectedRows = [];
    const entryIndex = column.columnDef;
    const targetColIndex = this.currentMetadataColumnNameIndices.get(entryIndex);
    const colIndex = this.currentMetadataRowIndices.get(targetColIndex);
    if (event.altKey) {
      if (colIndex > -1) {
        this.selectedRows.splice(colIndex, 1);
      } else {
        this.selectedRows.push(entryIndex);
      }
    } else if (event.shiftKey) {
      let lastSelectionIndex = null;
      let lastRowIndex = -1;
      const colNamesArray: any[] = this.tableData.displayedColumns.map(
        (e) => e.columnDef
      );
      if (this.lastColSelection) {
        lastSelectionIndex = this.lastColSelection.index;
        lastRowIndex = colNamesArray.indexOf(lastSelectionIndex);
      } else {
        lastRowIndex = 0;
      }
      const currentRowIndex = colNamesArray.indexOf(entryIndex);
      let currentSelection = [];

      if (lastRowIndex > currentRowIndex) {
        currentSelection = colNamesArray.slice(
          currentRowIndex,
          lastRowIndex + 1
        );
      } else {
        currentSelection = colNamesArray.slice(
          lastRowIndex,
          currentRowIndex + 1
        );
      }
      this.selectedColumns = this.selectedColumns.concat(currentSelection);
    } else {
      if (colIndex >= 0) {
        this.selectedColumns = [entryIndex];
      } else {
        this.selectedColumns = [];
      }
    }
    this.lastColSelection = column;
  }

  rowClick(row: any, event) {
    this.selectedCells = [];
    this.selectedColumns = [];
    const entryIndex = row.index;
    const rowIndex = this.selectedRows.indexOf(entryIndex);
    if (event && event.altKey) {
      if (rowIndex > -1) {
        this.selectedRows.splice(rowIndex, 1);
      } else {
        this.selectedRows.push(entryIndex);
      }
    } else if (event && event.shiftKey) {
      let lastSelectionIndex = null;
      let lastRowIndex = -1;
      const rowNamesArray: any[] = this.tableData.data.rows.map((e) => e.index);
      if (this.lastRowSelection) {
        lastSelectionIndex = this.lastRowSelection.index;
        lastRowIndex = rowNamesArray.indexOf(lastSelectionIndex);
      } else {
        lastRowIndex = 0;
      }
      const currentRowIndex = rowNamesArray.indexOf(entryIndex);
      let currentSelection = [];

      if (lastRowIndex > currentRowIndex) {
        currentSelection = rowNamesArray.slice(
          currentRowIndex,
          lastRowIndex + 1
        );
      } else {
        currentSelection = rowNamesArray.slice(
          lastRowIndex,
          currentRowIndex + 1
        );
      }
      this.selectedRows = this.selectedRows.concat(currentSelection);
    } else {
      if (rowIndex < 0) {
        this.selectedRows = [entryIndex];
      } else {
        this.selectedRows = [];
      }
    }
    this.lastRowSelection = row;
  }

  cellClick(row: any, column: any, event, rowIdx) {
    if (event.altKey) {
      this.selectedCells.push([column.columnDef, row.index]);
    } else {
      this.selectedCells = [[column.columnDef, row.index]];
    }
    this.getOntologyObject();
  }

  editCell(row: any, column: any, event, rowIdx) {
    if (!this.isReadOnly) {
      this.isCellTypeFile = false;
      this.isCellTypeOntology = false;
      this.isCellTypeControlList = false;
      this.isEditModalOpen = true;
      this.selectedCell["row"] = row;
      this.selectedCell["column"] = column;

      // if (this.fileColumns.indexOf(column.header) > -1) {
      //   this.isCellTypeFile = true;
      // }

      if (this.enableControlList && this.controlListColumns.size === 0
        && this.validations && this.validation && this.data && this.data.header) {
        this.detectControlListColumns();
      }
      if (this.controlListColumns.has(column.header) && this.controlListColumns.get(column.header)["data-type"] === "string" ) {
        this.isCellTypeControlList = true;
        this.cellControlListValue();
      } else if (this.ontologyColumns.indexOf(column.header) > -1) {
        this.isCellTypeOntology = true;
        this.cellOntologyValue();
      }

      this.editCellform = this.fb.group({
        cell: [row[column.columnDef]],
      });
    }
  }

  getOntologyComponentValue(id) {
    return this.ontologyComponents.filter(
      (component) => component.id === id
    )[0];
  }

  isObject(val) {
    if (val === null) {
      return false;
    }
    return typeof val === "function" || typeof val === "object";
  }

  saveCell() {
    let cellsToUpdate = [];
    let columnIndex = this.selectedCell["column"].targetColumnIndex;
    if (this.isObject(columnIndex)) {
      if (columnIndex.index !== null) {
        columnIndex = columnIndex.index;
      }
    }
    if (this.isCellTypeControlList) {
      const selectedOntology =
        this.getOntologyComponentValue("editControlListCell").values[0];
      const value = selectedOntology ? selectedOntology.annotationValue : "";
      cellsToUpdate = [
        {
          row: this.selectedCell["row"].index,
          column: columnIndex,
          value,
        }
      ];
    } else if (this.isCellTypeOntology) {
      const selectedOntology =
        this.getOntologyComponentValue("editOntologyCell").values[0];

      const value = selectedOntology ? selectedOntology.annotationValue : "";
      const termSource = selectedOntology ? selectedOntology.termSource.name : "";
      const termAccession = selectedOntology ? selectedOntology.termAccession : "";
      cellsToUpdate = [
        {
          row: this.selectedCell["row"].index,
          column: columnIndex,
          value,
        },
        {
          row: this.selectedCell["row"].index,
          column: columnIndex + 1,
          value: termSource,
        },
        {
          row: this.selectedCell["row"].index,
          column: columnIndex + 2,
          value: termAccession,
        },
      ];
    } else if (this.isCellTypeFile) {
      cellsToUpdate = [
        {
          row: this.selectedCell["row"].index,
          column: columnIndex,
          value: this.editCellform.get("cell").value,
        },
      ];
    } else {
      cellsToUpdate = [
        {
          row: this.selectedCell["row"].index,
          column: columnIndex,
          value: this.editCellform.get("cell").value,
        },
      ];
    }
    this.isFormBusy = true;
    this.editorService
      .updateMAFTableCells(
        this.currentMetadata.file,
        { data: cellsToUpdate }
      )
      .subscribe(
        (res) => {
          toastr.success("Cells updated successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.isEditModalOpen = false;
          this.isFormBusy = false;
          this.updateTableData(cellsToUpdate);
        },
        (err) => {
          console.error(err);
          this.isFormBusy = false;
        }
      );
  }

  updateTableData(cells: any) {
    cells.forEach(element => {
      let tableRowIndex = -1;
      if(this.currentMetadataRowIndices.has(element.row)) {
        tableRowIndex = this.currentMetadataRowIndices.get(element.row);
      }
      let tableColIndex = -1;
      if(this.currentMetadataRowIndices.has(element.column)) {
        tableColIndex = this.currentMetadataColumnIndices.get(element.column);
      }
      if (tableColIndex > -1 && tableRowIndex > -1) {
        const colName = this.currentMetadata.columnNames[tableColIndex];
        this.currentPage[tableRowIndex][colName] = element.value;
      }
    });
  }
  saveColumnSelectedMissingRowsValues() {
    const selectedMissingOntology = this.getOntologyComponentValue(
      "editMissingOntology"
    ).values[0];
    const validOntology = selectedMissingOntology?.termSource?.name?.length > 0;
    if (!validOntology){
      return;
    }

    const cellsToUpdate = [];
    let accIndex = this.data.header[this.selectedMissingCol.accession];
    if (this.isObject(accIndex)) {
      if (accIndex.index !== null) {
        accIndex = accIndex.index;
      }
    }

    let refIndex = this.data.header[this.selectedMissingCol.ref];
    if (this.isObject(refIndex)) {
      if (refIndex.index !== null) {
        refIndex = refIndex.index;
      }
    }

    let columnIndex = this.getHeaderIndex(
      this.data.header[this.selectedMissingKey]
    );

    if (this.isObject(columnIndex)) {
      if (columnIndex.index !== null) {
        columnIndex = columnIndex.index;
      }
    }

    this.currentPage.forEach((row) => {
      if (row[this.selectedMissingKey] === this.selectedMissingVal) {
        cellsToUpdate.push(
          {
            row: row.index,
            column: columnIndex,
            value: selectedMissingOntology.annotationValue,
          },
          {
            row: row.index,
            column: refIndex,
            value: selectedMissingOntology.termSource.name,
          },
          {
            row: row.index,
            column: accIndex,
            value: selectedMissingOntology.termAccession,
          }
        );
      }
    });
    this.isFormBusy = true;
    this.editorService
      .updateMAFTableCells(
        this.currentMetadata.file,
        { data: cellsToUpdate }
      )
      .subscribe(
        (res) => {
          toastr.success("Cells updated successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.closeEditMissingColValModal();
          if(this.selectedMissingCol.missingTerms.has(selectedMissingOntology.annotationValue)){
            this.selectedMissingCol.missingTerms.delete(selectedMissingOntology.annotationValue);
          }
          this.updateTableData(cellsToUpdate);
          this.isFormBusy = false;
        },
        (err) => {
          console.error(err);
          this.isFormBusy = false;
        }
      );
  }

  saveColumnSelectedRowsValues() {
    let sRows = [];
    if (this.selectedRows.length > 0) {
      this.selectedRows.forEach((r) => {
        sRows.push(this.currentPage[r]);
      });
    } else {
      sRows = this.currentPage;
    }
    const cellsToUpdate = [];
    const columnIndex = this.selectedColumn.targetColumnIndex;
    if (this.isCellTypeOntology) {
      const selectedOntology =
        this.getOntologyComponentValue("editOntologyColumn").values[0];

      sRows.forEach((row) => {
        cellsToUpdate.push(
          {
            row: row.index,
            column: columnIndex,
            value: selectedOntology.annotationValue,
          },
          {
            row: row.index,
            column: columnIndex + 1,
            value: selectedOntology.termSource.name,
          },
          {
            row: row.index,
            column: columnIndex + 2,
            value: selectedOntology.termAccession,
          }
        );
      });
    } else {
      sRows.forEach((row) => {
        cellsToUpdate.push({
          row: row.index,
          column: columnIndex,
          value: this.editColumnform.get("cell").value,
        });
      });
    }
    this.isFormBusy = true;
    this.editorService
      .updateMAFTableCells(
        this.currentMetadata.file,
        { data: cellsToUpdate }
      )
      .subscribe(
        (res) => {
          toastr.success("Cells updated successfully", "Success", {
            timeOut: "4000",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.isEditColumnModalOpen = false;
          this.isFormBusy = false;
          this.updateTableData(cellsToUpdate);
        },
        (err) => {
          console.error(err);
          this.isFormBusy = false;
        }
      );
  }

  onEditCellChanges(event) {
    this.editCellform.markAsDirty();
  }


  cellControlListValue() {
    const selectedCellColumn = this.selectedCell["column"].header;
    const cellValue = this.selectedCell["row"][this.selectedCell["column"].header];
    if (cellValue && cellValue !== "" && cellValue !== undefined) {
      const newOntology = new Ontology();
      newOntology.termSource = new OntologySourceReference();
      const value = this.selectedCell["row"][this.selectedCell["column"].header];
      newOntology.annotationValue = value;
      if (this.controlListNames.has(selectedCellColumn)){
        const controlListName = this.controlListNames.get(selectedCellColumn);
        if (controlListName in this.editorService.defaultControlLists){
          const defaultControlList = this.editorService.defaultControlLists[controlListName].OntologyTerm;
          const values = defaultControlList.filter((val) => val.annotationValue === value);
          if (values.length > 0) {
            newOntology.termAccession = values[0].termAccession;
            newOntology.termSource.name = values[0].termSource.name;
            newOntology.termSource.provenance_name = values[0].termSource.provenanceName;
            newOntology.termSource.file = values[0].termSource.file;
            this.selectedCellOntology = newOntology;
            return;
          }
        }
      }
      newOntology.termAccession = "";
      newOntology.termSource.description = "";
      newOntology.termSource.file = "";
      newOntology.termSource.name = "";
      newOntology.termSource.provenance_name = "";
      newOntology.termSource.version = "";
      this.selectedCellOntology = newOntology;
    } else {
      this.selectedCellOntology = null;
    }
  }

  cellOntologyValue() {
    const data = this.data.header[this.selectedCell["column"].header];
    let columnIndex = 0;
    if (typeof data === 'number') {
      columnIndex = data;
    } else {
      columnIndex = data.index;
    }
    const termSourceRefColumnName = this.data.columns[columnIndex + 1].header;
    const termAccessionColumnName = this.data.columns[columnIndex + 2].header;;

    const cellValue =
      this.selectedCell["row"][this.selectedCell["column"].header];
    if (cellValue && cellValue !== "" && cellValue !== undefined) {
      const newOntology = new Ontology();
      newOntology.annotationValue =
        this.selectedCell["row"][this.selectedCell["column"].header];
      newOntology.termAccession = this.selectedCell["row"][termAccessionColumnName];
      newOntology.termSource = new OntologySourceReference();
      newOntology.termSource.description = "";
      newOntology.termSource.file = "";
      newOntology.termSource.name = this.selectedCell["row"][termSourceRefColumnName];
      newOntology.termSource.provenance_name = "";
      newOntology.termSource.version = "";
      this.selectedCellOntology = newOntology;
    } else {
      this.selectedCellOntology = null;
    }
  }

  getValidationDefinition(header) {
    let selectedColumn = null;
    if (this.tableData?.data?.file && this.tableData.data.file.startsWith("a_") && this.assayTechnique.name === null) {
      const result = this.editorService.extractAssayDetails(this.tableData);
      this.assayTechnique.name = result.assayTechnique?.name;
      this.assayTechnique.sub = result.assaySubTechnique?.name;
      this.assayTechnique.main = result.assayMainTechnique?.name;
    }
    // const tableTechnique = this.tableData.meta?.assayTechnique?.name;
    let techniqueSpecificColumn = null;
    this.validation.default_order.forEach((col) => {
      if (col.header === header) {
        if (this.assayTechnique.name !== null && "techniqueNames" in col && col["techniqueNames"] && col["techniqueNames"].length > 0) {
          if (col["techniqueNames"].indexOf(this.assayTechnique.name) > -1 ){
            selectedColumn = col;
            if (techniqueSpecificColumn === null ) {
              techniqueSpecificColumn = col;
            }
          }
        } else {
          selectedColumn = col;
        }
      }
    });
    return techniqueSpecificColumn ? techniqueSpecificColumn : selectedColumn;
  }
  columnControlList(header) {
    if (this.enableControlList && header && this.controlListNames.has(header)){
      if (this.controlLists.has(header)) {
        return this.controlLists.get(header);
      } else {
        const controlListName = this.controlListNames.get(header);
        if (controlListName in this.editorService.defaultControlLists) {
          const ontologies = this.editorService.defaultControlLists[controlListName].OntologyTerm;
          this.controlLists.set(header, {name: header, values: ontologies});
          return this.controlLists.get(header);
        }
      }
    }
    if (this.enableControlList) {
      return this.defaultControlList;
    }
    return {};
  }

  columnValidations(header) {
    if (this.enableControlList && header && this.controlListColumns.size > 0 && this.controlListColumns.has(header)){
      return this.controlListColumns.get(header)["ontology-details"];
    }
    if (this.enableControlList){
      return this.validations.default_ontology_validation["ontology-details"];
    }
    return {};
    // const formattedColumnName = header.replace(/\.[0-9]+$/, "");
    // let selectedColumn = null;
    // const tableTechnique = this.assayTechnique.name;
    // const validation = this.validation;
    // const detail = "ontology-details";
    // if ("default_order" in validation) {
    //   this.validation.default_order.forEach((col) => {
    //     if (col.header === formattedColumnName &&  detail in col && col[detail] && "recommended-ontologies" in col[detail]) {
    //       if (tableTechnique && "techniqueNames" in col && col["techniqueNames"] && col["techniqueNames"].length > 0) {
    //         if (col["techniqueNames"].indexOf(tableTechnique) > -1 ){
    //           selectedColumn = col;
    //         }
    //       } else {
    //         selectedColumn = col;
    //       }
    //     }
    //   });
    // }

    // if (selectedColumn) {
    //   return selectedColumn[id];
    // } else {
    //   return this.validations.default_ontology_validation["ontology-details"];
    // }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  editColumn(column, e) {
    if (!this.isReadOnly) {
      this.isCellTypeFile = false;
      this.isCellTypeOntology = false;
      this.isEditColumnModalOpen = true;

      this.selectedColumn = column;

      // if (this.fileColumns.indexOf(column.header) > -1) {
      //   this.isCellTypeFile = true;
      // }

      if (this.ontologyColumns.indexOf(column.header) > -1) {
        this.isCellTypeOntology = true;
      }

      this.editColumnform = this.fb.group({
        cell: [],
      });

      this.editColumnform.markAsDirty();
    }
  }

  closeEditColumnModal() {
    this.isEditColumnModalOpen = false;
  }

  copy(text: string) {
    this.clipboardService.copyFromContent(text);
    toastr.success("", "Copied to clipboard", {
      timeOut: "1000",
      positionClass: "toast-top-center",
      preventDuplicates: true,
      extendedTimeOut: 0,
      tapToDismiss: false,
    });
  }

  isEmpty(val) {
    return val === "" || val === "undefined" || val === null;
  }

  getUnique(arr) {
    return arr.filter((value, index, array) => array.indexOf(value) === index);
  }

  getKeys(object) {
    return Object.keys(object);
  }

  autoPopulate(col, key, val) {
    const cellsToUpdate = [];
    const accIndex = this.getHeaderIndex(this.data.header[col.accession]);
    const refIndex = this.getHeaderIndex(this.data.header[col.ref]);
    const columnIndex = this.getHeaderIndex(this.data.header[key]);
    this.currentPage.forEach((row) => {
      if (row[key] === val) {
        cellsToUpdate.push(
          {
            row: row.index,
            column: refIndex,
            value: col.values[val][0],
          },
          {
            row: row.index,
            column: accIndex,
            value: col.values[val][1],
          }
        );
      }
    });
    this.isFormBusy = true;
    this.editorService
      .updateMAFTableCells(
        this.currentMetadata.file,
        { data: cellsToUpdate }
      )
      .subscribe(
        (res) => {
          toastr.success("Cells updated successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.isEditColumnModalOpen = false;
          this.isFormBusy = false;
          if(col.missingTerms.has(val)){
            col.missingTerms.delete(val);
          }
          this.updateTableData(cellsToUpdate);
        },
        (err) => {
          console.error(err);
          this.isFormBusy = false;
        }
      );
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

  getOntologyObject() {
    let firstCell = null;
    if (this.selectedCells.length > 0) {
      firstCell = this.selectedCells[0];
    }
    const columnName = firstCell[0];
    // const columnIndex = this.data.header[columnName].index;
    const columnIndex = this.currentMetadata.columnNames.indexOf(columnName);

    // const columns = Object.keys(tableHeader).sort(
    //   (a, b) => tableHeader[a] - tableHeader[b]
    // );
    // const columnIndex = tableHeader[firstCell[0]];
    // if (firstCell) {
    //   if (this.ontologyCols[firstCell[0]]) {
    //     const sOntology = new Ontology();
    //     sOntology.annotationValue = this.data.rows[firstCell[1]][firstCell[0]];
    //     sOntology.termAccession =
    //       this.data.rows[firstCell[1]][this.data.columns[columnIndex + 2].header];
    //     sOntology.termSource = new OntologySourceReference();
    //     sOntology.termSource.description = "";
    //     sOntology.termSource.file = "";
    //     sOntology.termSource.name =
    //       this.data.rows[firstCell[1]][this.data.columns[columnIndex + 1].header];
    //     sOntology.termSource.provenance_name = "";
    //     sOntology.termSource.version = "";
    //     this.selectedOntologyCell = sOntology;
    //   } else {
    //     this.selectedOntologyCell = null;
    //   }
    // }
  }

  filterDuplicate(value) {
    // this.selectedRows = [];
    // this.filters = [];
    // this.dataSource.data = this.tableData.data.rows;
    // let data = [];
    // if (this.filters.indexOf(value) < 0) {
    //   this.filters.push(value);
    // }
    // this.dataSource.filter = "";
    // this.filters.forEach((f) => {
    //   data = data.concat(
    //     this.dataSource.data.filter(
    //       (d) =>
    //         this.getDataString(d).toLowerCase().indexOf(f.toLowerCase()) > -1
    //     )
    //   );
    // });
    // this.dataSource.data = data;
    // this.selectedRows = this.selectedRows.concat(
    //   this.dataSource.data
    //     .filter((f) => f["Sample Name"] === value)
    //     .map((p) => p.index)
    // );
  }

  onChanges() {}

  triggerChanges() {
    this.updated.emit();
  }

  editRow(row) {
    this.rowEdit.emit(row);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tableData) {
      if (this.tableData) {
        this.initialise();
        this.triggerChanges();
      }
    }
  }
}

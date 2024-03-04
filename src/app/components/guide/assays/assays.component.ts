import { Component, ViewChild, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import { select } from "@angular-redux/store";
import { MTBLSColumn } from "./../../../models/mtbl/mtbls/common/mtbls-column";
import * as toastr from "toastr";
import Swal from "sweetalert2";
import { tassign } from "tassign";
import { SamplesComponent } from "./../../study/samples/samples.component";
import { environment } from "src/environments/environment";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata.state";
import { Observable } from "rxjs";
import { Select } from "@ngxs/store";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";

@Component({
  selector: "guide-assays",
  templateUrl: "./assays.component.html",
  styleUrls: ["./assays.component.css"],
})
export class GuidedAssaysComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.files) studyFiles;
  @select((state) => state.study.assays) studyAssays;
  @select((state) => state.study.samples) studySamples;


  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(AssayState.assays) assays$: Observable<Record<string, any>>;
  @Select(FilesState.files) studyFiles$: Observable<IStudyFiles>;
  @Select(SampleState.samples) studySamples$: Observable<Record<string, any>>;

  @ViewChild(SamplesComponent) sampleTable: SamplesComponent;

  requestedStudy: string = null;
  loading = false;
  assays: any = [];

  selectedMAFDataArray: any[] = [];
  selectedAssay: any = null;
  selectedAssayData: any = null;
  samplesNames: any = "";
  controlsNames: any = "";

  isEditAssayModalOpen = false;
  subStep = 1;
  files: any = [];
  samples: any = {};
  baseHref: string;
  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editorService.initialiseStudy(this.route);
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
    this.baseHref = this.editorService.configService.baseHref;
  }

  setUpSubscriptions() {
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.studyFiles.subscribe((value) => {
      if (value != null) {
        this.files = value;
      } else {
        this.editorService.loadStudyFiles(false);
      }
    });
    this.studyAssays.subscribe((value) => {
      this.assays = Object.values(value);
      if (this.assays.length > 0) {
        this.assays.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      }
    });
    this.studySamples.subscribe((value) => {
      this.samples = value;
    });
  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) this.requestedStudy = value
    });
    this.studyFiles$.subscribe((value) => {
      if (value != null) {
        this.files = value;
      } else {
        this.editorService.loadStudyFiles(false);
      }
    });
    this.assays$.subscribe((value) => {
      this.assays = Object.values(value);
      if (this.assays.length > 0) {
        this.assays.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      }
    });
    this.studySamples$.subscribe((value) => {
      this.samples = value;
    });
  }

  ngOnInit() {}

  deleteSelectedAssay(name) {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this assay!",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Confirm",
      cancelButtonText: "Back",
    }).then((willDelete) => {
      if (willDelete.value) {
        this.editorService.deleteAssay(name).subscribe((resp) => {
          this.extractAssayInfo(true);
          Swal.fire({
            title: "Assay deleted!",
            text: "",
            type: "success",
            confirmButtonText: "OK",
          }).then(() => {});
        });
      }
    });
  }

  saveSamples() {
    const exisitingSamples = [];
    if (this.controlsNames && this.samplesNames) {
      const finalControls = this.controlsNames.replace(/,/g, "\n").split("\n");
      const finalSamples = this.samplesNames.replace(/,/g, "\n").split("\n");
      if (finalSamples.length <= 0) {
        toastr.error("Please add sample names", "Error", {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        });
      } else {
        const sRows = [];
        const duplicatedExist = false;
        const duplicates = [];
        finalControls.forEach((s) => {
          if (exisitingSamples.indexOf(s) < 0) {
            const emptyRow = this.getEmptyRow(this.samples.data);
            emptyRow["Source Name"] = s;
            emptyRow["Sample Name"] = s;
            emptyRow["Protocol REF"] = "Sample collection";
            sRows.push(emptyRow);
          } else {
            duplicates.push(s);
          }
        });
        finalSamples.forEach((s) => {
          if (exisitingSamples.indexOf(s) < 0) {
            const emptyRow = this.getEmptyRow(this.samples.data);
            emptyRow["Source Name"] = s;
            emptyRow["Sample Name"] = s;
            emptyRow["Protocol REF"] = "Sample collection";
            sRows.push(emptyRow);
          } else {
            duplicates.push(s);
          }
        });
        if (duplicates.length > 0 && sRows.length > 0) {
          Swal.fire({
            title: "Duplicate samples found",
            text: duplicates.join(", ") + " already exist",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ignore duplicates, proceed!",
          }).then((result) => {
            if (result.value) {
              this.editorService
                .addRows(
                  this.samples.name,
                  { data: { rows: sRows, index: 0 } },
                  "samples",
                  null
                )
                .subscribe(
                  (res) => {
                    toastr.success("Samples added successfully", "Success", {
                      timeOut: "2500",
                      positionClass: "toast-top-center",
                      preventDuplicates: true,
                      extendedTimeOut: 0,
                      tapToDismiss: false,
                    });
                    this.controlsNames = "";
                    this.samplesNames = "";
                    this.changeSubStep(4);
                  },
                  (err) => {
                    console.log(err);
                  }
                );
            }
          });
        } else if (duplicates.length > 0 && sRows.length === 0) {
          this.changeSubStep(4);
        } else {
          this.editorService
            .addRows(
              this.samples.name,
              { data: { rows: sRows, index: 0 } },
              "samples",
              null
            )
            .subscribe(
              (res) => {
                toastr.success("Samples added successfully", "Success", {
                  timeOut: "2500",
                  positionClass: "toast-top-center",
                  preventDuplicates: true,
                  extendedTimeOut: 0,
                  tapToDismiss: false,
                });
                this.controlsNames = "";
                this.samplesNames = "";
                this.changeSubStep(4);
              },
              (err) => {
                console.log(err);
              }
            );
        }
      }
    } else {
      toastr.error(
        "Please add experimental controls and sample names",
        "Error",
        {
          timeOut: "2500",
          positionClass: "toast-top-center",
          preventDuplicates: true,
          extendedTimeOut: 0,
          tapToDismiss: false,
        }
      );
    }
  }

  getEmptyRow(data) {
    const obj = tassign({}, data.rows[0]);
    Object.keys(obj).forEach((prop) => {
      obj[prop] = "";
    });
    return obj;
  }

  changeSubStep(i) {
    this.subStep = i;
    if (i === 2) {
      this.checkSampleTypeColumnExists();
    }
  }

  checkSampleTypeColumnExists() {
    const sampleTypeColumn = this.samples.data.columns.filter(
      (col) => col.columnDef === "Characteristics[Sample type]"
    );
    if (sampleTypeColumn.length > 0) {
      console.log("Sample type column exist. Extraction sample types.");
    } else {
      Swal.fire({
        title:
          "Sample type column doesnt exist. Would you like to capture sample types data?",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((selection) => {
        if (selection.value) {
          this.addSampleTypeColumn();
        }
      });
    }
  }

  addSampleTypeColumn() {
    let characteristicsCount = 0;
    this.keys(this.samples.data.header).forEach((key) => {
      if (key.indexOf("Characteristics") > -1) {
        characteristicsCount = characteristicsCount + 1;
      }
    });

    const protocolRefIndex = this.samples.data.header["Protocol REF"];

    const columns = [];
    const characteristicsColumn = new MTBLSColumn(
      "Characteristics[Sample type]",
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
    this.addColumns(columns);
  }

  addColumns(columns) {
    this.editorService
      .addColumns(this.samples.name, { data: columns }, "samples", null)
      .subscribe(
        (res) => true,
        (err) => {
          console.log(err);
          return false;
        }
      );
  }

  keys(object) {
    return Object.keys(object);
  }

  openEditAssayModal(assay, substep) {
    this.subStep = 1;
    this.selectedMAFDataArray = [];
    this.selectedAssay = assay;
    this.selectedAssayData = this.selectedAssay.data;
    this.isEditAssayModalOpen = true;
  }

  closeEditAssayModal() {
    this.isEditAssayModalOpen = false;
  }

  openFullStudyView() {
    Swal.fire({
      title: "Switch to full study view? Are you sure?",
      text: "Please add assay details by using the add/edit details button!",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Confirm",
      cancelButtonText: "Back",
    }).then((willDelete) => {
      if (willDelete.value) {
        this.router.navigate(["/study", this.requestedStudy]);
      }
    });
  }

  extractAssayInfo(reloadFiles) {
    if (reloadFiles) {
      this.editorService.loadStudyFiles(true);
    } else {
      this.editorService.loadStudyAssays(this.files);
    }
  }
}

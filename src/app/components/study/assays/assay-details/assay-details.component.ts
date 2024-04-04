import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from "@angular/core";
import { select } from "@angular-redux/store";
import Swal from "sweetalert2";
import { EditorService } from "../../../../services/editor.service";
import { TableComponent } from "./../../../shared/table/table.component";
import { environment } from "src/environments/environment";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { Observable } from "rxjs";
import { Select, Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { env } from "process";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { Assay, AssayList } from "src/app/ngxs-store/study/assay/assay.actions";
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";

@Component({
  selector: "assay-details",
  templateUrl: "./assay-details.component.html",
  styleUrls: ["./assay-details.component.css"],
})
export class AssayDetailsComponent implements OnInit {
  @Input("assayName") assayName: any;
  @select((state) => state.study.assays) assays;
  @select((state) => state.study.samples) studySamples;
  @ViewChild(TableComponent) assayTable: TableComponent;

  @select((state) => state.study.readonly) readonly;

  @Select(AssayState.assays) assays$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(SampleState.samples) studySamples$: Observable<Record<string, any>>;
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;

  @Output() assayDelete = new EventEmitter<any>();

  private studyId: string = null

  isReadOnly = false;

  fileTypes: any = [
    {
      filter_name: "MetaboLights assay sheet type", // eslint-disable-line @typescript-eslint/naming-convention
      extensions: ["txt"],
    },
  ];

  assay: any = null;
  addSamplesModalOpen = false;
  filteredSampleNames: any = [];

  sampleNames: any = [];
  existingSampleNamesInAssay: any = [];
  duplicateSampleNamesInAssay: any = [];

  constructor(private editorService: EditorService, private store: Store) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpConstructorSubscription();
    }
    if (environment.useNewState) this.setUpConstructorSubscriptionNgxs();
  }

  setUpConstructorSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpConstructorSubscriptionNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpOnInitSubscriptions() {
    this.assays.subscribe((value) => {
      this.assay = value[this.assayName];
    });
    this.studySamples.subscribe((value) => {
      if (value.data) {
        this.sampleNames = value.data.rows.map((r) => r["Sample Name"]);
        this.filteredSampleNames = this.sampleNames;
      }
    });
  }

  setUpOnInitSubscriptionsNgxs() {
    this.assays$.subscribe((value) => {
      this.assay = value[this.assayName];
    });
    this.studySamples$.subscribe((value) => {
      if (value.data) {
        this.sampleNames = value.data.rows.map((r) => r["Sample Name"]);
        this.filteredSampleNames = this.sampleNames;
      }
    });
    this.studyIdentifier$.subscribe(id => this.studyId = id);
  }

  ngOnInit() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpOnInitSubscriptions();
    }
    if (environment.useNewState) this.setUpOnInitSubscriptionsNgxs();
  }

  onSamplesFilterKeydown(event, filterValue: string) {
    if (event.key === "Enter") {
      this.filteredSampleNames(filterValue);
    }
  }

  applySamplesFilter(filterValue: string) {
    this.filterSampleNames(filterValue);
  }

  filterSampleNames(filterValue) {
    this.duplicateSampleNamesInAssay = [];
    if (filterValue === "") {
      this.filteredSampleNames = this.sampleNames;
    } else {
      this.filteredSampleNames = this.sampleNames.filter(
        (s) => s.toString().indexOf(filterValue) !== -1
      );
    }

    this.existingSampleNamesInAssay.forEach((n) => {
      if (this.filteredSampleNames.indexOf(n) > -1) {
        this.duplicateSampleNamesInAssay.push(n);
      }
    });
  }

  addSamples() {
    const emptyRow = this.assayTable.getEmptyRow();
    const dataToWrite = [];
    this.filteredSampleNames.forEach((n) => {
      const tempRow = JSON.parse(JSON.stringify(emptyRow));
      tempRow["Sample Name"] = n;
      dataToWrite.push(tempRow);
    });
    this.assayTable.addRows(dataToWrite, 0);
    this.addSamplesModalOpen = false;
  }

  validateAssaySheet() {
    this.editorService.validateMAF(this.assayName).subscribe((data) => {
      console.log("MAF updated");
    });
  }

  openAddSamplesModal() {
    this.addSamplesModalOpen = true;
  }

  closeAddSamplesModal() {
    this.addSamplesModalOpen = false;
  }

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
        if (environment.useNewState) {
          this.store.dispatch(new Assay.Delete(name, this.studyId)).subscribe(
            (completed) => {
              this.assayDelete.emit(name);
              //this.store.dispatch(new AssayList.Get(this.studyId));
              this.store.dispatch(new Protocols.Get());
              Swal.fire({
                title: "Assay deleted!",
                text: "",
                type: "success",
                confirmButtonText: "OK",
              }).then(() => {});
            }
          )
        } else {
          this.editorService.deleteAssay(name).subscribe((resp) => {
            this.assayDelete.emit(name);
            this.editorService.loadStudyFiles(true);
            window.location.reload();
            Swal.fire({
              title: "Assay deleted!",
              text: "",
              type: "success",
              confirmButtonText: "OK",
            }).then(() => {});
          });
        }

      }
    });
  }
}

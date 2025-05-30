import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  inject,
} from "@angular/core";
import Swal from "sweetalert2";
import { EditorService } from "../../../../services/editor.service";
import { TableComponent } from "./../../../shared/table/table.component";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { Assay } from "src/app/ngxs-store/study/assay/assay.actions";
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ConfigurationService } from "src/app/configuration.service";

@Component({
  selector: "assay-details",
  templateUrl: "./assay-details.component.html",
  styleUrls: ["./assay-details.component.css"],
})
export class AssayDetailsComponent implements OnInit {
  @Input("assayName") assayName: any;
  @ViewChild(TableComponent) assayTable: TableComponent;


  assays$: Observable<Record<string, any>> = inject(Store).select(AssayState.assays);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  studySamples$: Observable<Record<string, any>> = inject(Store).select(SampleState.samples);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  assay$: Observable<any>;

  @Output() assayDelete = new EventEmitter<any>();

  private studyId: string = null

  isReadOnly = false;
  templateRowPresent: boolean = false;

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
  guidesUrl = ""
  constructor(private editorService: EditorService, private store: Store,
      private configService: ConfigurationService) {
    this.guidesUrl = configService.config.metabolightsWSURL.guides
    this.setUpConstructorSubscriptionNgxs();
  }


  setUpConstructorSubscriptionNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }


  setUpOnInitSubscriptionsNgxs() {

    this.assays$.subscribe((value) => {
      if (Object.keys(value).length > 0 && this.assayName !== undefined) {
        this.assay = value[this.assayName];
        if(this.assay !== undefined){
          this.assay.data.rows[0].index === -1 ? this.templateRowPresent = true : null
        }
      }

    });
    this.studySamples$.subscribe((value) => {
      if (value && value.data) {
        this.sampleNames = value.data.rows.map((r) => r["Sample Name"]);
        this.filteredSampleNames = this.sampleNames;
      }
    });
    this.studyIdentifier$.subscribe(id => this.studyId = id);
  }

  ngOnInit() {
    this.setUpOnInitSubscriptionsNgxs();
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
      }
    });
  }
}

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
import { Assay, AssayList } from "src/app/ngxs-store/study/assay/assay.actions";
import { Protocols } from "src/app/ngxs-store/study/protocols/protocols.actions";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ConfigurationService } from "src/app/configuration.service";
import { MAF } from "src/app/ngxs-store/study/maf/maf.actions";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { AddAssayComponent } from "src/app/components/shared/add-assay/add-assay.component";
import { BehaviorSubject, combineLatest, ReplaySubject } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";

@Component({
  selector: "assay-details",
  templateUrl: "./assay-details.component.html",
  styleUrls: ["./assay-details.component.css"],
})
export class AssayDetailsComponent implements OnInit {
  @Input("assayName") assayName: any;
  @ViewChild(TableComponent) assayTable: TableComponent;
  @ViewChild(AddAssayComponent) editAssayModal: AddAssayComponent;


  assays$: Observable<Record<string, any>> = inject(Store).select(AssayState.assays);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  studySamples$: Observable<Record<string, any>> = inject(Store).select(SampleState.samples);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  assayList$: Observable<IAssay[]> = inject(Store).select(AssayState.assayList);

  assay$: Observable<any>;

  @Output() assayDelete = new EventEmitter<any>();

  private studyId: string = null
  private assayName$ = new ReplaySubject<string>(1);

  isReadOnly = false;
  templateRowPresent: boolean = false;

  fileTypes: any = [
    {
      filter_name: "MetaboLights assay sheet type", // eslint-disable-line @typescript-eslint/naming-convention
      extensions: ["txt"],
    },
  ];

  assay: any = null;
  assayInfo: IAssay = null;
  assayType: string = "";
  assayTypeLabel: string = "";
  omicsType: string = "";
  measurementType: string = "";
  studyComments: any[] = [];
  addSamplesModalOpen = false;
  filteredSampleNames: any = [];
  autoFillColumns: boolean = true;

  sampleNames: any = [];
  existingSampleNamesInAssay: any = [];
  duplicateSampleNamesInAssay: any = [];
  guidesUrl = ""
  // map of sampleName -> whether that sample should be autofilled
  selectedSampleMap: { [sampleName: string]: boolean } = {};

  designDescriptors: Ontology[] = [];

  constructor(private editorService: EditorService, private store: Store,
      private configService: ConfigurationService) {
    this.guidesUrl = configService.config.metabolightsWSURL.guides
    this.setUpConstructorSubscriptionNgxs();
  }

  get namesToAdd(): string[] {
    return Object.keys(this.selectedSampleMap || {}).filter(
      (k) =>
        !!this.selectedSampleMap[k] &&
        (this.filteredSampleNames || []).includes(k) &&
        k.toString().trim().length > 0
    );
  }

  // optional convenience getter
  get namesToAddCount(): number {
    return this.namesToAdd.length;
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
      if (value && this.assayName !== undefined) {
        const currentAssay = value[this.assayName];
        if (currentAssay) {
          this.assay = currentAssay;
          this.assay.data?.rows?.[0]?.index === -1 ? this.templateRowPresent = true : this.templateRowPresent = false;
        }
      }
    });
    this.assayList$.subscribe(assays => {
        if (assays && this.assayName) {
            const assayInfo = assays.find(a => a.filename === this.assayName);
            if (assayInfo) {
                this.assayInfo = assayInfo;
                this.extractMetadataFromComments(assayInfo);
            }
        }
    });
    this.studySamples$.subscribe((value) => {
      if (value && value.data) {
        this.sampleNames = (value.data.rows || []).map((r) => (r ? r["Sample Name"] : "")).filter((s) => s && s.toString().trim().length > 0);
        this.filteredSampleNames = [...this.sampleNames];
      }
    });
    this.studyIdentifier$.subscribe(id => this.studyId = id);
  }

  extractMetadataFromComments(assayInfo: IAssay) {
    if (!assayInfo || !assayInfo.comments) return;

    const comments = assayInfo.comments;
    const getValue = (name: string) => comments.find(c => c.name === name)?.value || "";

    this.assayType = getValue('Assay Type');
    this.assayTypeLabel = getValue('Assay Type Label');
    this.omicsType = getValue('Omics Type');
    
    // Prioritize annotationValue from measurementType object if available
    this.measurementType = assayInfo.measurementType?.annotationValue || getValue('Measurement Type');

    const descriptors = getValue('Assay Descriptor');
    const accessions = getValue('Assay Descriptor Term Accession Number');
    const refs = getValue('Assay Descriptor Term Source REF');

    if (descriptors) {
        const descArray = descriptors.split(';');
        const accArray = accessions ? accessions.split(';') : [];
        const refArray = refs ? refs.split(';') : [];

        this.designDescriptors = descArray.map((name, i) => {
            const ontology = new Ontology();
            ontology.annotationValue = name;
            ontology.termAccession = accArray[i] || "";
            ontology.termSource = {
                name: refArray[i] || "",
                file: "",
                version: "",
                description: "",
                comments: []
            } as any;
            return ontology;
        });
    } else {
        this.designDescriptors = [];
    }
  }

  openEditAssayModal() {
    this.editAssayModal.openAddAssayModal();
  }

  onDescriptorSaved(descriptor: Ontology) {
      this.designDescriptors.push(descriptor);
      this.saveDescriptors();
  }

  onDescriptorEdited(descriptor: Ontology, index: number) {
      this.designDescriptors[index] = descriptor;
      this.saveDescriptors();
  }

  removeDescriptor(index: number) {
      this.designDescriptors.splice(index, 1);
      this.saveDescriptors();
  }

  saveDescriptors() {
      if (!this.assay) return;
      const payload = {
          fields: {
              measurementType: this.measurementType
          },
          comments: [
              { name: "Assay Type", value: this.assayType },
              { name: "Assay Type Label", value: this.assayTypeLabel },
              { name: "Omics Type", value: this.omicsType },
              { name: "Assay Descriptor", value: this.designDescriptors.map(d => d.annotationValue).join(';') },
              { name: "Assay Descriptor Term Accession Number", value: this.designDescriptors.map(d => d.termAccession).join(';') },
              { name: "Assay Descriptor Term Source REF", value: this.designDescriptors.map(d => d.termSource?.name).join(';') }
          ]
      };

      this.editorService.updateAssayComments(this.studyId, this.assayName, payload).subscribe(
          () => {
              this.store.dispatch(new AssayList.Get(this.studyId));
          }
      );
  }

  ngOnInit() {
    this.setUpOnInitSubscriptionsNgxs();
  }

  ngOnChanges(changes: any) {
    if (changes.assayName && this.assayName) {
        this.store.select(AssayState.assayList).pipe(take(1)).subscribe((assays: IAssay[]) => {
            if (assays) {
                const assayInfo = assays.find(a => a.filename === this.assayName);
                if (assayInfo) {
                    this.extractMetadataFromComments(assayInfo);
                }
            }
        });
    }
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
      const source = (this.sampleNames || []).filter((s) => s && s.toString().trim().length > 0);
      const f = (filterValue || "").toString().trim().toLowerCase();
      if(f === "") {
        this.filteredSampleNames = source.slice();
      } else {
        this.filteredSampleNames = source.filter((s) =>
          s.toString().toLowerCase().includes(f)
        );
      }
      this.duplicateSampleNamesInAssay = (this.existingSampleNamesInAssay || []).filter(
        (n) => this.filteredSampleNames.indexOf(n) > -1
      );
  }


  toggleSelectAll(checked: boolean) {
    (this.filteredSampleNames || []).forEach((n) => {
      if (n && n.toString().trim().length > 0) {
        this.selectedSampleMap[n] = checked;
      }
    });
  }

  areAllSelected(): boolean {
    if (!this.filteredSampleNames || this.filteredSampleNames.length === 0) return false;
    const valid = (this.filteredSampleNames || []).filter(n => n && n.toString().trim().length > 0);
    if (valid.length === 0) return false;
    return valid.every((n) => !!this.selectedSampleMap[n]);
  }

 addSamples() {
    const emptyRow = this.assayTable.getEmptyRow();
    const dataToWrite: any[] = [];

    // get current rows
    const rows =
      this.assay && this.assay.data && Array.isArray(this.assay.data.rows)
        ? this.assay.data.rows
        : [];
     // always copy from the first row (if present), otherwise use emptyRow
    const sourceRow = rows.length > 0 ? rows[1] : emptyRow;

    // columns to clear when copying from sourceRow
    const ignoreColumns = [
      "Extract Name",
      "Raw Spectral Data File",
      "Derived Spectral Data File",
      "MS Assay Name",
      "Normalization Name",
      "Data Transformation Name"
    ];

    const candidateKeysFor = (name: string) => {
      const noSpace = name.replace(/\s+/g, "");
      const camel = noSpace.charAt(0).toLowerCase() + noSpace.slice(1);
      return [name, noSpace, camel];
    };

  // namesToAdd computed from selectedSampleMap earlier in the file
    const namesToAdd = Object.keys(this.selectedSampleMap || {}).filter(
      (k) => this.selectedSampleMap[k] && (this.filteredSampleNames || []).includes(k)
    );

    // use footer toggle to decide whether to copy columns for selected samples
    const useSourceForAll = !!this.autoFillColumns;

    namesToAdd.forEach((s) => {
      if (!s || s.toString().trim().length === 0) return;
      const useSource = !!(useSourceForAll && this.selectedSampleMap[s]);
      const base = useSource ? sourceRow : emptyRow;
      const newRow = JSON.parse(JSON.stringify(base));

      if (newRow["Sample Name"] !== undefined) newRow["Sample Name"] = s;
      else if (newRow.sampleName !== undefined) newRow.sampleName = s;
      else newRow["Sample Name"] = s;

      if (useSource) {
        ignoreColumns.forEach((col) =>
          candidateKeysFor(col).forEach((k) => {
            if (newRow[k] !== undefined) newRow[k] = "";
          })
        );
      }

      if (newRow.index !== undefined) delete newRow.index;
      if (newRow._internalId !== undefined) delete newRow._internalId;

      dataToWrite.push(newRow);
    });

    if (dataToWrite.length > 0) {
      // append to bottom of sheet: insertion index = current rows length
      const insertionIndex = rows.length;
      this.assayTable.addRows(dataToWrite, insertionIndex);
    }

    this.addSamplesModalOpen = false;
    this.selectedSampleMap = {};
    this.autoFillColumns = false;
  }

  closeAddSamplesModal() {
    this.addSamplesModalOpen = false;
    this.autoFillColumns = false;
    this.selectedSampleMap = {};
  }

  validateAssaySheet() {
    this.editorService.validateMAF(this.assayName).subscribe((data) => {
      console.log("MAF updated");
    });
  }

  openAddSamplesModal() {

    // ensure filteredSampleNames populated if needed
    if (!this.filteredSampleNames || this.filteredSampleNames.length === 0) {
      this.filteredSampleNames = (this.sampleNames || []).filter(
        (s) => s && s.toString().trim().length > 0
      );
    }

    this.addSamplesModalOpen = true;
    this.autoFillColumns = true;
    // mark all visible (filtered) samples as selected by default
    (this.filteredSampleNames || []).forEach((s) => {
      if (s && s.toString().trim().length > 0) {
        this.selectedSampleMap[s] = true;
      }
    });
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
  refreshData() {
  // Reload the current assay sheet
  this.store.dispatch(new Assay.OrganiseAndPersist(this.assayName, this.studyId)).subscribe(() => {
    // After assay reload, get the updated assay object
    this.assays$.subscribe((assays) => {
      const assay = assays[this.assayName];
      if (assay && assay.mafs && Array.isArray(assay.mafs)) {
        // Reload each referenced MAF sheet
        assay.mafs.forEach((mafFile) => {
          this.store.dispatch(new MAF.Organise(mafFile, this.studyId));
        });
      }
    });
  });
}
}

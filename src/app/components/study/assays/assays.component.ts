import { Component, Output, EventEmitter } from "@angular/core";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { Observable } from "rxjs";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "mtbls-assays",
  templateUrl: "./assays.component.html",
  styleUrls: ["./assays.component.css"],
})
export class AssaysComponent {

  @Select(AssayState.assayList) assayFiles$: Observable<IAssay[]>;
  @Select(AssayState.assays) studyAssays$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;

  isReadOnly = false;

  assays: any = [];
  studyAssayFiles: any = [];
  currentSubIndex = 0;
  assaysNames: any = [];

  constructor() {

    this.setUpSubscriptionsNgxs();
    
  }


  setUpSubscriptionsNgxs() {
    this.assayFiles$.subscribe((assayfiles) => {
      //console.log(`number of assay files returned from state select: ${assayfiles.length}`)
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          if (this.studyAssayFiles.length !== this.assays.length) this.assays.push({});
          else break
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/indent
    this.studyAssays$.subscribe((value) => {
      if (this.studyAssayFiles) {
        // @ts-ignore
        console.log(`Number of sheets returned by state select: ${value.length}`)
        let i = 0;
        this.studyAssayFiles.forEach((assayFileName) => {
          const assayName = assayFileName.filename.trim();
          if (this.assaysNames.indexOf(assayName) === -1 && value[assayName]) {

            this.assays = [...this.assays];
            this.assays[i] = value[assayName];
            this.assaysNames = [...this.assaysNames, assayName];
          }
          i++;
        });
        console.log(`Total number of assay sheets in component: ${this.assays.length}`);
        this.assays = this.assays.filter(obj => Object.keys(obj).length > 0);

      }
      // eslint-disable-next-line @typescript-eslint/indent
    });

    this.readonly$.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
  }

  assayDeleted(name) {
    let i = 0;
    let assayIndex = -1;
    this.assays.forEach((assay) => {
      if (assay.name === name) {
        assayIndex = i;
      }
      i = i + 1;
    });
    if (i > -1) {
      this.assays.splice(assayIndex, 1);
    }
    this.currentSubIndex = 0;
    this.assaysNames.splice(this.assaysNames.indexOf(name), 1);
  }

  selectCurrentSubTab(i) {
    this.currentSubIndex = i;
  }
}

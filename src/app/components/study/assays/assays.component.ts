import { Component, Output, EventEmitter } from "@angular/core";
import { select } from "@angular-redux/store";
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
  @select((state) => state.study.assays) studyAssays;
  @select((state) => state.study.studyAssays) assayFiles;
  @select((state) => state.study.readonly) readonly;

  @Select(AssayState.assayList) assayFiles$: Observable<IAssay[]>;
  @Select(AssayState.assays) studyAssays$: Observable<Record<string, any>>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;

  isReadOnly = false;

  assays: any = [];
  studyAssayFiles: any = [];
  currentSubIndex = 0;
  assaysNames: any = [];

  constructor() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) {
      this.setUpSubscriptionsNgxs();
    }
  }

  setUpSubscriptions() {
    this.assayFiles.subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          this.assays.push({});
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/indent
    this.studyAssays.subscribe((value) => {
      if (this.studyAssayFiles) {
        // @ts-ignore
        let i = 0;
        this.studyAssayFiles.forEach((assayFileName) => {
          const assayName = assayFileName.filename.trim();
          if (this.assaysNames.indexOf(assayName) === -1 && value[assayName]) {
            this.assays[i] = value[assayName];
            this.assaysNames.push(assayName);
          }
          i++;
        });
      }
      // eslint-disable-next-line @typescript-eslint/indent
    });

    this.readonly.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.assayFiles$.subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          this.assays.push({});
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/indent
    this.studyAssays$.subscribe((value) => {
      if (this.studyAssayFiles) {
        // @ts-ignore
        let i = 0;
        this.studyAssayFiles.forEach((assayFileName) => {
          const assayName = assayFileName.filename.trim();
          if (this.assaysNames.indexOf(assayName) === -1 && value[assayName]) {
            this.assays[i] = value[assayName];
            this.assaysNames.push(assayName);
          }
          i++;
        });
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

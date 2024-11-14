import { Component, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { filter, Observable } from "rxjs";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { AnalyticalMethodPipe } from "./assay-analytical-method-pipe";
import { NumberDuplicatesPipe } from "./number-duplicate-methods-pipe";

@Component({
  selector: "mtbls-assays",
  templateUrl: "./assays.component.html",
  styleUrls: ["./assays.component.css"],
  providers: [AnalyticalMethodPipe, NumberDuplicatesPipe]
})
export class AssaysComponent {

  assayFiles$: Observable<IAssay[]> = inject(Store).select(AssayState.assayList);
  studyAssays$: Observable<Record<string, any>> = inject(Store).select(AssayState.assays);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isReadOnly = false;

  assays: any = [];
  studyAssayFiles: any = [];
  currentSubIndex = 0;
  assaysNames: any = [];

  constructor(private analyticalMethodPipe: AnalyticalMethodPipe, private numberDuplicatesPipe: NumberDuplicatesPipe) {

    this.setUpSubscriptionsNgxs();
    
  }

  getLabel(val) {
    return this.numberDuplicatesPipe.transform(val);
  }


  setUpSubscriptionsNgxs() {
    this.assayFiles$.pipe(filter(val => val !== null)).subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        this.assaysNames = this.numberDuplicatesPipe.transform(
          this.studyAssayFiles.map(val => this.analyticalMethodPipe.transform(val.filename))
        );
        console.log(this.assaysNames);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          if (this.studyAssayFiles.length !== this.assays.length) this.assays.push({});
          else break
        }
      }
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

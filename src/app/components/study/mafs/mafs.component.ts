import { Component, OnInit, Input } from "@angular/core";
import { select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { Select } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { AssayState } from "src/app/ngxs-store/study/assay/assay.state";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { MAFState } from "src/app/ngxs-store/study/maf/maf.state";

@Component({
  selector: "mtbls-mafs",
  templateUrl: "./mafs.component.html",
  styleUrls: ["./mafs.component.css"],
})
export class MafsComponent implements OnInit {
  @Input("assayName") assayName: any;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.assays) studyAssays;
  @select((state) => state.study.studyAssays) assayFiles;
  @select((state) => state.study.mafs) studyMAFs;

  @Select(AssayState.assayList) assayFiles$: Observable<IAssay[]>;
  @Select(AssayState.assays) studyAssays$: Observable<Record<string, any>>;
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(MAFState.mafs) studyMAFs$: Observable<Record<string, any>>;


  assays: any = [];
  mafs: any = [];
  mafNames: any = [];
  studyAssayFiles: any = [];
  currentSubIndex = 0;
  loading = false;
  requestedStudy: string = null;

  constructor(public router: Router) {}

  ngOnInit() {
    this.mafs = [];
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });

    this.assayFiles.subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
    });

    // eslint-disable-next-line @typescript-eslint/indent
    this.studyAssays.subscribe((value) => {

      this.assays = value;
      const tempMAFs = [];
      Object.values(this.assays).forEach((assay) => {
        //const assertAssay = assay as any;
        assay["mafs"].forEach((maf) => {
          // eslint-disable-line @typescript-eslint/dot-notation
          tempMAFs.push(maf);
        });
      });
      let i = 0;

      const deletedMAFS = [];
      this.mafs.forEach((maf) => {
        let exists = false;
        tempMAFs.forEach((mafName) => {
          if (maf && maf.name === mafName) {
            exists = true;
          }
        });
        if (!exists) {
          deletedMAFS.push(i);
        }
        i = i + 1;
      });
      if (deletedMAFS.length > 0) {
        deletedMAFS.forEach((indice) => {
          this.mafs.splice(indice, 1);
        });
      }
    });

    if (this.studyAssayFiles) {
      this.studyAssayFiles.forEach((assayFileName) => {
        if (this.assays) {
          const assayName = assayFileName.filename.trim();

          if (this.assays && this.assays[assayName] && this.assays[assayName].hasOwnProperty("mafs")) {
            this.assays[assayName].mafs.forEach((mafFile) => {
              if (
                this.mafNames.indexOf(mafFile) === -1 &&
                mafFile.indexOf("m_") === 0
              ) {
                this.mafNames.push(mafFile);
              }
            });
          }
        }
      });
    }

    this.studyMAFs$.subscribe((value) => {
      if (this.mafNames) {
        this.mafNames.forEach((mafFile) => {
          this.mafs.push(value[mafFile]);
        });
      }
      if (value && this.mafNames.length === 0) {
        if (this.router.url.indexOf("metabolites") > -1) {
          this.router.navigate(["/study", this.requestedStudy]);
        }
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });

    this.assayFiles$.subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
    });

    // eslint-disable-next-line @typescript-eslint/indent
    this.studyAssays$.subscribe((value) => {

      this.assays = value;
      const tempMAFs = [];
      Object.values(this.assays).forEach((assay) => {
        //const assertAssay = assay as any;
        assay["mafs"].forEach((maf) => {
          // eslint-disable-line @typescript-eslint/dot-notation
          tempMAFs.push(maf);
        });
      });
      let i = 0;

      const deletedMAFS = [];
      this.mafs.forEach((maf) => {
        let exists = false;
        tempMAFs.forEach((mafName) => {
          if (maf && maf.name === mafName) {
            exists = true;
          }
        });
        if (!exists) {
          deletedMAFS.push(i);
        }
        i = i + 1;
      });
      if (deletedMAFS.length > 0) {
        deletedMAFS.forEach((indice) => {
          this.mafs.splice(indice, 1);
        });
      }
    });

    if (this.studyAssayFiles) {
      this.studyAssayFiles.forEach((assayFileName) => {
        if (this.assays) {
          const assayName = assayFileName.filename.trim();

          if (this.assays && this.assays[assayName] && this.assays[assayName].hasOwnProperty("mafs")) {
            this.assays[assayName].mafs.forEach((mafFile) => {
              if (
                this.mafNames.indexOf(mafFile) === -1 &&
                mafFile.indexOf("m_") === 0
              ) {
                this.mafNames.push(mafFile);
              }
            });
          }
        }
      });
    }

    this.studyMAFs.subscribe((value) => {
      if (this.mafNames) {
        this.mafNames.forEach((mafFile) => {
          this.mafs.push(value[mafFile]);
        });
      }
      if (value && this.mafNames.length === 0) {
        if (this.router.url.indexOf("metabolites") > -1) {
          this.router.navigate(["/study", this.requestedStudy]);
        }
      }
    });
  }

  selectCurrentSubTab(i) {
    this.currentSubIndex = i;
  }
}

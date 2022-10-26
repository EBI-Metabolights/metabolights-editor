import { Component, OnInit, Input } from "@angular/core";
import { select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";

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
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
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
        assay.mafs.forEach((maf) => {
          // eslint-disable-line @typescript-eslint/dot-notation
          tempMAFs.push(maf);
        });
      });
      let i = 0;

      const deletedMAFS = [];
      this.mafs.forEach((maf) => {
        let exists = false;
        tempMAFs.forEach((mafName) => {
          if (maf.name === mafName) {
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
          if (this.assays[assayName].mafs.length > 0) {
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

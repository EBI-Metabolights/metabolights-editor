import { Component, Output, EventEmitter, platformCore, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { RowTemplateService } from "src/app/services/row-template.service";
import { concatMap, map, take, toArray } from "rxjs/operators";
import { Observable, Subject, combineLatest, forkJoin, from, of } from "rxjs";


export class TemplateRowCollection {
  nmr: Record<string, any>;
  lcms: Record<string, any>;
  gcms: Record<string, any>;
  dims: Record<string, any>;

  constructor(
    nmr: Record<string, any> = {},
    lcms: Record<string, any> = {},
    gcms: Record<string, any> = {},
    dims: Record<string, any> = {}
  ) {
    this.nmr = nmr;
    this.lcms = lcms;
    this.gcms = gcms;
    this.dims = dims;
  }
}

@Component({
  selector: "mtbls-assays",
  templateUrl: "./assays.component.html",
  styleUrls: ["./assays.component.css"],
})
export class AssaysComponent {
  @select((state) => state.study.assays) studyAssays;
  @select((state) => state.study.studyAssays) assayFiles;
  @select((state) => state.study.readonly) readonly;
  isReadOnly = false;

  assays: any = [];
  studyAssayFiles: any = [];
  currentSubIndex = 0;
  assaysNames: any = [];

  templateRows: TemplateRowCollection = new TemplateRowCollection();
  assaysPrepared: boolean = false;
  rowTemplatesPrepared: boolean = false;


  constructor(private rowTemplateService: RowTemplateService, private cdr: ChangeDetectorRef) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }


  setUpSubscriptions() {
    const assaysLoadedSubject = new Subject();
    assaysLoadedSubject.subscribe(
      (value) => {
        console.debug(`assay subject marked ${value}`)
      }
    );

    combineLatest([assaysLoadedSubject, this.readonly]).subscribe(([studyAssaysValue, readonlyValue]) => {
      console.debug(`in combine latest block`)
      if (!this.isReadOnly) {
        this.initializeTemplatePreparation();
      } else {
        this.assaysPrepared = true;
      }
    });
    
    // Regular subscription to assayFiles
    this.assayFiles.subscribe((assayfiles) => {
      this.studyAssayFiles = assayfiles;
      if (this.studyAssayFiles) {
        for (let i = 0; i < this.studyAssayFiles.length; i++) {
          this.assays.push({});
        }
      }
    });
  
    this.studyAssays.subscribe((value) => {
      if (this.studyAssayFiles && Object.keys(value).length === Object.keys(this.studyAssayFiles).length) {
        console.log('got both assay files')
        let i = 0;
        this.studyAssayFiles.forEach((assayFileName) => {
          const assayName = assayFileName.filename.trim();
          if (/**this.assaysNames.indexOf(assayName) === -1 &&*/ value[assayName]) {
            this.assays[i] = value[assayName];
            this.assaysNames.push(assayName);
          }
          i++;
        });
        assaysLoadedSubject.next('ready')
      }
    });
  
    this.readonly.subscribe((value) => {
      if (value !== null) {
        this.isReadOnly = value;
      }
    });

  
    // Combined subscription to execute once both studyAssays and readonly have emitted
    

  }

  // Method to get templates
getTemplates(): Observable<any> {
  const observables = this.assaysNames.map((assayName) => {
    const attr = stripHyphensAndLowercase(this.rowTemplateService.getTemplateByAssayFilename(assayName));
    
    // If template row already exists, return an observable that emits null
    if (Object.keys(this.templateRows[attr]).length !== 0) {
      return of(null);
    }
    
    // Otherwise, make the HTTP call and map the response
    return this.rowTemplateService.getTemplateRow(assayName).pipe(
      take(1),
      map((template) => {
        if (template !== null) {
          this.templateRows[attr] = template;
        }
        return this.templateRows;
      })
    );
  });

  // Use forkJoin to wait for all HTTP calls to complete
  return forkJoin(observables);
}

// Method to prepare template rows in assays
prepareTemplateRowsInAssays() {
  this.assaysNames.forEach((assayName) => {
    if (this.rowTemplateShouldBeInserted(assayName)) {
      this.assaysPrepared = false;
      const attr = stripHyphensAndLowercase(this.rowTemplateService.getTemplateByAssayFilename(assayName));
      if (Object.keys(this.templateRows[attr]).length !== 0) {
        const index = this.assays.findIndex(assay => assay.name === assayName);
        if (index !== -1) {
          if (this.assays[index].data.rows[0].index !== -1) {
            this.assays[index].data.rows.unshift(this.templateRows[attr]);
            this.rowTemplateService.markAsPrepared(assayName);
            for (let i = 1; i < this.assays[index].data.rows.length; i++) {
              this.assays[index].data.rows[i].index += 0;
            }
            console.log(`assay ${assayName} looks like ${this.assays[index].data.rows[0].index}`)
            this.cdr.detectChanges();
          } else { this.cdr.detectChanges();}

        }
  
      } else {
        console.warn(`Expected template row not found for ${attr}`);
      }
      // previously flags were set here
    }
  });
  this.assaysPrepared = true;
  this.rowTemplatesPrepared = true;
}

rowTemplateShouldBeInserted(assayName: string): boolean {
  if (this.rowTemplateService.recentlyEdited.includes(assayName)) {
    console.debug(`we should be in here for ${assayName}`)
    this.rowTemplateService.removeAsRecentlyEdited(assayName);
    return true 
  }
  if (this.rowTemplateService.preparedAssays.includes(assayName)) {
    return false
  }
  return true;
}

// Method to initialize and ensure the correct order of operations
initializeTemplatePreparation() {
  this.getTemplates().subscribe(
    () => {
      console.debug('Templates retrieved.');
      this.prepareTemplateRowsInAssays();
      console.debug('Templates prepared and rows are ready.');
    },
    (error) => {
      console.error('Error during template preparation:', error);
    }
  );
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

function stripHyphensAndLowercase(input: string): string {
  return input.replace(/-/g, '').toLowerCase();
}
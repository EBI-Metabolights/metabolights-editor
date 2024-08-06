import { Component, ChangeDetectorRef } from "@angular/core";
import { select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { RowTemplateService } from "src/app/services/row-template.service";
import { map, take} from "rxjs/operators";
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
      if (!this.isReadOnly) {
        let anyAssayHasTemplate = false;
        this.assaysNames.forEach((assayName) => {
          let result = this.rowTemplateService.getTemplateByAssayFilename(assayName);
          if (result !== null) anyAssayHasTemplate = true
        });

        if (anyAssayHasTemplate) this.initializeTemplatePreparation();
        else this.assaysPrepared = true;
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
        let i = 0;
        this.studyAssayFiles.forEach((assayFileName) => {
          const assayName = assayFileName.filename.trim();
          if (value[assayName]) {
            this.assays[i] = value[assayName];
            if (assayName != null) this.assaysNames.push(assayName);
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

/**
 * Get the template rows for each of this studies current assays, if a template for that assay type exists.
 * Uses RxJs's forkjoin operator to await the collection of all template rows, and return them as a single observable.
 * @returns Observable<any> containing all template rows that pertain to assays in the current study.
 * 
 */
getTemplates(): Observable<any> {
  const observables = this.assaysNames.map((assayName) => {
    const templ = this.rowTemplateService.getTemplateByAssayFilename(assayName);
    if (templ === null) return templ

    const attr = stripHyphensAndLowercase(templ);
    
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
  }).filter(observable => observable !== null)

  // Use forkJoin to wait for all HTTP calls to complete
  return forkJoin(observables);
}

/**
 * Iterate over assay names, check whether a row template needs inserting, and if it does, retrieve it, check that it is 
 * populated, failsafe check that there isn't already a template row inserted, and pending success of that failsafe check, insert it.
 * Manually trigger change detection, and set assaysPrepared and rowTemplatesPrepared flags (table rendering conditional on these flag values)
 */
prepareTemplateRowsInAssays(): void {
  this.assaysNames.forEach((assayName) => {
    if (this.rowTemplateShouldBeInserted(assayName)) {
      this.assaysPrepared = false;
      const templ = this.rowTemplateService.getTemplateByAssayFilename(assayName)
      if (templ !== null) {
        const attr = stripHyphensAndLowercase(templ);
        if (Object.keys(this.templateRows[attr]).length !== 0) { // if the template is not empty
          const index = this.assays.findIndex(assay => assay.name === assayName);
          if (index !== -1) { // if we have an assay in component matching the current assay name
  
            if (this.assays[index].data.rows[0].index !== -1) { // if a template row is not present (all template rows have -1 index)
  
              this.assays[index].data.rows.unshift(this.templateRows[attr]); // insert the template row at the start of the Array.
              this.rowTemplateService.markAsPrepared(assayName); // Mark as 'prepared' to prevent another template row being inserted.
  
              this.cdr.detectChanges(); // Manually trigger change detection to make sure nested child components receive changes
            } else { this.cdr.detectChanges();} // failsafe to make sure nested child components receive changes
  
          }
    
        } else {
          console.warn(`Expected template row not found for ${attr}`);
        }

      }

      // previously flags were set here
    }
  });
  this.assaysPrepared = true;
  this.rowTemplatesPrepared = true;
}

/**
 * Decide whether a row template row needs to be inserted. 'false' if we already have one, 'true' if one has never been inserted, or there has
 * been a recent edit to the assay sheet and the template row needs to be re-inserted.
 * @param assayName Name of the assay sheet IE. a_MTBLS_DI-MS...txt, used to xref with the RowTemplateService to make insertion decision.
 * @returns bool
 */
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

/**
 * Retrieve the assay templates, and then call the inserting method.
 */
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
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/configuration.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { TableService } from './table.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { IAssay } from 'src/app/models/mtbl/mtbls/interfaces/assay.interface';

@Injectable({
  providedIn: 'root'
})
export class AssaysService extends BaseConfigDependentService {

  //private studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  private validationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.studyRules);

  //private id: string;
  private rules: Record<string, any>;

  public loadingMessage: string = "Loading assays information."

  constructor(
    http: HttpClient, configService: ConfigurationService, store: Store, private tableService: TableService) {  
      super(http, configService, store);
      this.validationRules$.subscribe((rules) => {
        if (rules !== null) this.rules = rules;
      });
  }

  getAssaySheet(filename, suppliedId: string): Observable<ITableWrapper> {
    return this.tableService.getTable(filename, suppliedId);
  }

  deleteAssay(name, suppliedId: string): Observable<Object> {
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + suppliedId + "/assays/" + name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  extractAssayDetails(assay, suppliedId: string): Record<string, any> {
    if (assay.name.split(suppliedId)[1]) {
      const assayInfo = assay.name
        .split(suppliedId)[1]
        .split("_");
      let assaySubTechnique = null;
      let assayTechnique = null;
      let assayMainTechnique = null;
      if (this.rules && this.rules["assays"] && this.rules["assays"]["assaySetup"]) {
        this.rules["assays"]["assaySetup"].main_techniques.forEach((mt) => {
          mt.techniques.forEach((t) => {
            if (t.sub_techniques && t.sub_techniques.length > 0) {
              t.sub_techniques.forEach((st) => {
                if (st.template === assayInfo[1] || (assayInfo.length > 1 && st.template === assayInfo[2])) {
                  assaySubTechnique = st;
                  assayTechnique = t;
                  assayMainTechnique = mt;
                }
              });
            }
          });
        });
      }
      return {
        assaySubTechnique,
        assayTechnique,
        assayMainTechnique,
        template: assaySubTechnique?.template || null
      };
    }
    return {
      assaySubTechnique: null,
      assayTechnique: null,
      assayMainTechnique: null,
      template: null
    };
  }

  addAssay(body: any, suppliedId: string): Observable<IAssay> {
    return this.http
    .post<IAssay>(
      this.url.baseURL + "/studies" + "/" + suppliedId + "/assays",
      body,
      httpOptions
    )
    .pipe(catchError(this.handleError));
  }

  addColumnToAssaySheet(filename: string, body: Record<string, any>, id: string): Observable<any> {
    return this.tableService.addColumns(filename, body, id);
  }

  addRows(filename: string, body: Record<string, any>, suppliedId: string): Observable<any> {
    return this.tableService.addRows(filename, body, suppliedId);
  }

  deleteRows(filename: string, rowIds: any, suppliedId: string): Observable<any> {
    return this.tableService.deleteRows(filename, rowIds, suppliedId);
  }

  updateCells(filename, body, suppliedId): Observable<any> {
    return this.tableService.updateCells(filename, body, suppliedId);

  }
  
}

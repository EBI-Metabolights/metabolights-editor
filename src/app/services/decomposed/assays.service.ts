import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/configuration.service';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
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

  @Select(GeneralMetadataState.id) private studyIdentifier$: Observable<string>;
  @Select(ValidationState.rules) private validationRules$: Observable<Record<string, any>>;

  private id: string;
  private rules: Record<string, any>;

  public loadingMessage: string = "Loading assays information."

  constructor(
    http: HttpClient, configService: ConfigurationService, private store: Store, private tableService: TableService) {  
      super(http, configService);
      this.studyIdentifier$.subscribe((id) => {
        if (id !== null) this.id = id;
      });
      this.validationRules$.subscribe((rules) => {
        if (rules !== null) this.rules = rules;
      });
  }

  getAssaySheet(filename): Observable<ITableWrapper> {
    return this.tableService.getTable(filename, this.id);
  }

  deleteAssay(name): Observable<Object> {
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + this.id + "/assays/" + name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  extractAssayDetails(assay): Record<string, any> {
    if (assay.name.split(this.id)[1]) {
      const assayInfo = assay.name
        .split(this.id)[1]
        .split("_");
      let assaySubTechnique = null;
      let assayTechnique = null;
      let assayMainTechnique = null;
      if (this.rules) {
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
      };
    }
    return {
      assaySubTechnique: "",
      assayTechnique: "",
      assayMainTechnique: "",
    };
  }

  addAssay(body: any): Observable<IAssay> {
    return this.http
    .post<IAssay>(
      this.url.baseURL + "/studies" + "/" + this.id + "/assays",
      body,
      httpOptions
    )
    .pipe(catchError(this.handleError));
  }

  addColumnToAssaySheet(filename: string, body: Record<string, any>, id): Observable<any> {
    return this.tableService.addColumns(filename, body, id);
  }
  
}

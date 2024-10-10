import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { TableService } from './table.service';

@Injectable({
  providedIn: 'root'
})
export class SamplesService extends BaseConfigDependentService {

  //private studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  //private id: string;
  public samplesColumnOrder: Record<string, any> = {
    "Sample Name": 1,
    "Characteristics[Organism]": 2,
    "Characteristics[Organism part]": 3,
    "Characteristics[Variant]": 4,
    "Characteristics[Sample type]": 5,
    "Protocol REF": 6,
    "Source Name": 7,
  };
  public loadingMessage: string = "Loading samples data."
  public sampleSheetMissingPopupMessage: string = "Sample Sheet missing. Please upload sample sheet or contact Metabolights Help."
  

  constructor(
    http: HttpClient, configService: ConfigurationService, private tableService: TableService, store: Store) {  
      super(http, configService, store);
  }

  getTable(filename, suppliedId): Observable<ITableWrapper> {
    return this.http
      .get<ITableWrapper>(
        this.url.baseURL + "/studies" + "/" + suppliedId + "/" + filename,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addRows(filename, body, suppliedId): Observable<any> {
    return this.tableService.addRows(filename, body, suppliedId);
  }

  deleteRows(filename: string, rowIds: any, suppliedId): Observable<any> {
    return this.tableService.deleteRows(filename, rowIds, suppliedId);
  }

  addColumns(filename, body, suppliedId): Observable<any> {
    return this.tableService.addColumns(filename, body, suppliedId);
  }

  updateCells(filename, body, suppliedId): Observable<any> {
    return this.tableService.updateCells(filename, body, suppliedId);

  }



  
}

import { inject, Injectable } from '@angular/core';
import { TableService } from './table.service';
import { HttpClient } from '@angular/common/http';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import {  Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/configuration.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class MafService extends BaseConfigDependentService {

  //private id: string;
  public loadingMessage: string = "Loading MAF information."

  //private studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);


  constructor(
    http: HttpClient, configService: ConfigurationService, store: Store, private tableService: TableService) {  
      super(http, configService, store);
  }
  
  getMAFSheet(filename, suppliedId): Observable<ITableWrapper> {
    return this.tableService.getTable(filename, suppliedId);
  }

  addRows(filename, body, suppliedId): Observable<any> {
    return this.tableService.addRows(filename, body, suppliedId)
  }

  updateRow(filename, body, suppliedId): Observable<any> {
    return this.tableService.updateRows(filename, body, suppliedId)
  }

  deleteRows(filename: string, rowIds: any, suppliedId): Observable<any> {
    return this.tableService.deleteRows(filename, rowIds, suppliedId);
  }


  updateCells(filename, body, suppliedId): Observable<any> {
    return this.tableService.updateCells(filename, body, suppliedId);

  }}

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

  private id: string;
  public loadingMessage: string = "Loading MAF information."

  private studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);


  constructor(
    http: HttpClient, configService: ConfigurationService, private store: Store, private tableService: TableService) {  
      super(http, configService);
      this.studyIdentifier$.subscribe((id) => {
        if (id !== null) this.id = id
      });
  }
  
  getMAFSheet(filename): Observable<ITableWrapper> {
    return this.tableService.getTable(filename, this.id);
  }

  addRows(filename, body): Observable<any> {
    return this.tableService.addRows(filename, body, this.id)
  }

  updateRow(filename, body): Observable<any> {
    return this.tableService.updateRows(filename, body, this.id)
  }

  deleteRows(filename: string, rowIds: any): Observable<any> {
    return this.tableService.deleteRows(filename, rowIds, this.id);
  }


  updateCells(filename, body): Observable<any> {
    return this.tableService.updateCells(filename, body, this.id);

  }}

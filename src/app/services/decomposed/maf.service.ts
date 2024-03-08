import { Injectable } from '@angular/core';
import { TableComponent } from 'src/app/components/shared/table/table.component';
import { TableService } from './table.service';
import { HttpClient } from '@angular/common/http';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/configuration.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { ITableHeader, ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class MafService extends BaseConfigDependentService {

  private id: string;
  public loadingMessage: string = "Loading MAF information."

  @Select(GeneralMetadataState.id) private studyIdentifier$: Observable<string>


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
}

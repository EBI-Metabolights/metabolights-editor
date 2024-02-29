import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata.state';

@Injectable({
  providedIn: 'root'
})
export class SamplesService extends BaseConfigDependentService {

  @Select(GeneralMetadataState.id) private studyIdentifier$: Observable<string>

  private id: string;
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
    http: HttpClient, configService: ConfigurationService, private store: Store) {  
      super(http, configService);
      this.studyIdentifier$.subscribe((id) => {
        if (id !== null) this.id = id
      });
  }

  getTable(fileName): Observable<ITableWrapper> {
    return this.http
      .get<ITableWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/" + fileName,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }



  
}

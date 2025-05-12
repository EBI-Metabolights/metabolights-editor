import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from 'src/app/configuration.service';
import { DataService } from '../data.service';
import { MWSURL } from 'src/environment.interface';
import { filter, firstValueFrom, Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class BaseConfigDependentService extends DataService {
  protected configService: ConfigurationService;
  protected store: Store

  //public id: string;

  url: MWSURL = null;

  constructor(
    http: HttpClient,
     configService: ConfigurationService,
     store: Store
    ) {
      super('', http);
      this.configService = configService;
      this.store = store;
    
      firstValueFrom(
        this.configService.configLoaded$.pipe(
          filter(loaded => loaded === true)
        )
      ).then(() => {
        this.url = this.configService.config.metabolightsWSURL;
      });
    }
    
}

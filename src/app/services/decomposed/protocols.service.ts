import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { IProtocolWrapper } from 'src/app/models/mtbl/mtbls/interfaces/protocol-wrapper.interface';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { httpOptions } from '../headers';

@Injectable({
  providedIn: 'root'
})
export class ProtocolsService extends BaseConfigDependentService {

  constructor(http: HttpClient, configService: ConfigurationService) {
    super(http, configService)
   }

  getProtocols(id): Observable<IProtocolWrapper> {
    const studyId = id ? id : id;
    return this.http
      .get<IProtocolWrapper>(
        this.url.baseURL + "/studies" + "/" + studyId + "/protocols",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }
}

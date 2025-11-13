import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './decomposed/base-config-dependent.service';
import { Store } from '@ngxs/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from '../configuration.service';
import { catchError, map, Observable } from 'rxjs';
import { Ws3Response } from '../components/study/validations-v2/interfaces/validation-report.interface';

interface ProtocolStatus {
  online: boolean;
  status?: string;
}

export interface TransferStatus {
  privateFtp: ProtocolStatus;
  publicFtp: ProtocolStatus;
  aspera: ProtocolStatus;
}

interface TransferStatusResponse {
  transferStatus: TransferStatus;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransferHealthcheckService extends BaseConfigDependentService {

  constructor(http: HttpClient, configService: ConfigurationService, store: Store) {
    super(http, configService, store);
   }

   getHealthcheck(): Observable<Ws3Response<TransferStatusResponse>> {
        let headers = null;
        headers = new HttpHeaders({
          Accept: "application/json",
        });
        let baseUrl = this.configService.config.ws3URL;

        return this.http.get<Ws3Response<TransferStatusResponse>>(`${baseUrl}/system/v2/transfer-status`).pipe(
              map((res) => res),
              catchError(this.handleError)
            );
   }


}

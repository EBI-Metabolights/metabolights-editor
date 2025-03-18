import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { Store } from '@ngxs/store';
import { catchError, map, Observable } from 'rxjs';
import { Ws3Response } from 'src/app/components/study/validations-v2/interfaces/validation-report.interface';

export class DatasetLicenseResponse {
  dataset: DatasetLicense
}
export class DatasetLicense {
  name: string
  version: string
  agreed: boolean
  agreeingUser: string
}

@Injectable({
  providedIn: 'root'
})
export class DatasetLicenseService extends BaseConfigDependentService {

  constructor(http: HttpClient, configService: ConfigurationService, store: Store) {
    super(http, configService, store);
  }

  confirmLicenseAgreement(studyId: string): Observable<Ws3Response<DatasetLicenseResponse>> {
    let headers = null;
    headers = new HttpHeaders({
      Accept: "application/json",
    });
    let baseUrl = this.configService.config.ws3URL;

    return this.http.post<Ws3Response<DatasetLicenseResponse>>(`${baseUrl}/dataset-license/${studyId}`, {}, { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }

  getLicenseAgreement(studyId: string): Observable<Ws3Response<DatasetLicenseResponse>> {
    let headers = null;
    headers = new HttpHeaders({
      Accept: "application/json",
    });
    let baseUrl = this.configService.config.ws3URL;

    return this.http.get<Ws3Response<DatasetLicenseResponse>>(`${baseUrl}/dataset-license/${studyId}`, { headers }).pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }
}

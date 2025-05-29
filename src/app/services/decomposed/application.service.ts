import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/configuration.service';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { Observable } from 'rxjs';
import { LanguageMapping } from 'src/app/models/mtbl/mtbls/interfaces/language-mapping.interface';
import { PlatformLocation } from '@angular/common';
import { VersionInfo } from 'src/environment.interface';
import { ApiVersionInfo } from 'src/app/models/mtbl/mtbls/interfaces/common';
import { httpOptions } from '../headers';
import { MaintenanceStatus } from 'src/app/models/mtbl/mtbls/interfaces/maintenance-status.interface';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService extends BaseConfigDependentService {

  private baseHref: string;

  constructor(
    http: HttpClient, configService: ConfigurationService, private platformLocation: PlatformLocation, store: Store
  ) {
    super(http, configService, store);
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  // getLanguageMappings(): Observable<LanguageMapping> {
  //   let url = this.url.guides;
  //   if (this.url.guides.endsWith("/") === false){
  //     url = this.url.guides + "/";
  //   }
  //   return this.http
  //     .get<LanguageMapping>(url + "mapping.json")
  //     .pipe(catchError(this.handleError));
  // }

  // getGuides(language: string): Observable<Record<string, any>> {
  //   let url = this.url.guides;
  //   if (this.url.guides.endsWith("/") === false){
  //     url = this.url.guides + "/";
  //   }
  //   return this.http
  //     .get(url + "I10n/" + language + ".json")
  //     .pipe(catchError(this.handleError));
  // }

  getVersionInfo(): Observable<VersionInfo> {
    const url = this.baseHref + "assets/configs/version.json";
     return this.http
      .get<VersionInfo>(url)
      .pipe(catchError(this.handleError));
  }

  getApiVersionInfo(): Observable<ApiVersionInfo> {
    return this.http
      .get<ApiVersionInfo>(this.url.baseURL, httpOptions)
      .pipe(catchError(this.handleError));
  }

  getBannerHeader(): Observable<any> { // we need to type this
    return this.http
      .get<any>(
        this.url.baseURL + "/ebi-internal/banner",
        {
          headers: httpOptions.headers,
          observe: "body",
        }
      )
      .pipe(catchError(this.handleError));
  }

  checkMaintenanceMode(): Observable<MaintenanceStatus> { // not sure if type correct
    return this.http
      .get<any>(
        this.url.baseURL + "/ebi-internal/ws-status",
        {
          headers: httpOptions.headers,
          observe: "body",
        }
      )
      .pipe(catchError(this.handleError));
  }

  getDefaultControlLists(): Observable<Record<string, any>> {
    return this.http
        .get<any>(
          this.url.baseURL + "/ebi-internal/control-lists",
          {
            headers: httpOptions.headers,
            observe: "body",
          }
        )
        .pipe(catchError(this.handleError));
  }


}

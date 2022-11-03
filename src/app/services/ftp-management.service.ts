import { select } from '@angular-redux/store';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from '../configuration.service';
import { FTPResponse } from '../models/mtbl/mtbls/interfaces/generics/ftp-response.interface';
import { GenericHttpResponse } from '../models/mtbl/mtbls/interfaces/generics/generic-http-response.interface';
import { AppError } from './error/app-error';
import { httpOptions } from './headers';


@Injectable({
  providedIn: 'root'
})
/**
 * Service for ftp directory operations:
 *  - checking whether there are any new files in the FTP upload directory
 *  - synchronise the ftp directory with the study directory
 *  - check on the status of sync operations
 */
export class FtpManagementService {
  @select((state) => state.study.identifier) studyIdentifier;
  id: string;

  private url = '';

  /**
   * constructor
   * @param http http client for request making.
   * @param configService internal config service for retrieving API configuration values.
   */
  constructor(private http: HttpClient, private configService: ConfigurationService) {
    if (!environment.isTesting) {
      this.studyIdentifier.subscribe((value) => (
        this.url = `${configService.config.metabolightsWSURL.baseURL}/studies/${value}/ftp`));
    }
   }

   /**
    * Synchronise a study folder with its FTP directory. Triggers the transfer of files from 
    * FTP to the study directory.
    * @returns status (indicating whether the process has started or not)
    */
   public synchronise(): Observable<GenericHttpResponse> {
      return this.http.post<GenericHttpResponse>(`${this.url}/sync`,{}, httpOptions)
   }

   /**
    * Get the status of an already underway synchronise action. 
    * @returns FTPResponse object giving insight to the status of the process.
    */
   public getSyncStatus(): Observable<FTPResponse> {
     return this.http
      .get<FTPResponse>(`${this.url}/sync-status`, httpOptions)
   }

   /**
    * 'Calculates' any difference between the study directory and the FTP directory.
    * Note this will only retrieve the pre-existing calculation unless the 'force' flag is 
    * set to True.
    * @returns FTP response object giving insight into the current 'calculation'
    */
   public syncCalculation(force = false): Observable<FTPResponse> {
     return this.http.post<FTPResponse>(`${this.url}/sync-calculation?force=${force.toString()}`, {}, httpOptions)
   }

   public set service_url(newrl: string) {
    this.url = newrl;
   }
}

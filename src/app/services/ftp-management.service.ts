import { select } from '@angular-redux/store';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from '../configuration.service';
import { FTPResponse } from '../models/mtbl/mtbls/interfaces/generics/ftp-response.interface';
import { GenericHttpResponse } from '../models/mtbl/mtbls/interfaces/generics/generic-http-response.interface';
import { httpOptions } from './headers';
import { GeneralMetadataState } from '../ngxs-store/study/general-metadata.state';
import { Select } from '@ngxs/store';


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
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>

  id: string;

  private url = '';


  /**
   * constructor
   *
   * @param http http client for request making.
   * @param configService internal config service for retrieving API configuration values.
   */
  constructor(private http: HttpClient, private configService: ConfigurationService) {
      if (environment.useNewState) this.setUpSubscriptionNgxs(); 
      else {
        this.studyIdentifier.subscribe((value) => {
          if (value != null) {
            this.url = `${configService.config.metabolightsWSURL.baseURL}/studies/${value}/study-folders/rsync-task`;
          }
        });
      }

   }

  setUpSubscriptionNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.url = `${this.configService.config.metabolightsWSURL.baseURL}/studies/${value}/study-folders/rsync-task`;
      }
    });
  }

  public startRsync(dryRun: boolean=true, syncType: string, targetStagingArea: string): Observable<FTPResponse> {
    const syncOptions = this.syncOptions(String(dryRun), syncType, targetStagingArea);
    return this.http.post<FTPResponse>(`${this.url}`,{}, syncOptions);
  }


  public getRyncStatus(dryRun: boolean=true, syncType: string, targetStagingArea: string): Observable<FTPResponse> {
    const syncOptions = this.syncOptions(String(dryRun), syncType, targetStagingArea);
    return this.http.get<FTPResponse>(`${this.url}`, syncOptions);
  }

  public syncOptions(dryRun: string, syncType: string, targetStaging: string, sourceStagingArea: string="private-ftp") {

    return {
      headers: new HttpHeaders({
        //'Content-Type':  'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: "application/json",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_token: "dummy",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: "Bearer dummy",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        source_staging_area: sourceStagingArea,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        target_staging_area: targetStaging,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sync_type: syncType,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        dry_run: dryRun
      }),
    };
  }

   /**
    * Get the status of an already underway synchronise action.
    *
    * @returns FTPResponse object giving insight to the status of the process.
    */
   public getSyncStatus(syncType: string, targetStagingArea: string): Observable<FTPResponse> {
    const syncOptions = this.syncOptions("true", syncType, targetStagingArea);
    return this.http.get<FTPResponse>(`${this.url}`, syncOptions);
   }
}

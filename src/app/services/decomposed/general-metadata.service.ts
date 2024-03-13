import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStudySummary } from 'src/app/models/mtbl/mtbls/interfaces/study-summary.interface';
import { DataService } from '../data.service';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralMetadataService extends DataService{

  constructor(
    http: HttpClient, 
    private configService: ConfigurationService
    ) {    
      super("", http);
    // Create a promise to wait for configLoaded to become true
      const configLoadedPromise = new Promise<void>((resolve, reject) => {
      const subscription = this.configService.configLoaded$.subscribe(loaded => {
          if (loaded == true) {
              resolve(); // Resolve the promise when configLoaded becomes true
              subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
            }
        });
      });

  // Await the promise to wait for configLoaded to become true
      configLoadedPromise.then(() => {
          // Initialization logic once configLoaded is true
          this.url = this.configService.config.metabolightsWSURL;

      });
}


  /**
   * This method hits our API's IsaInvestigation resource. It does not return a MTBLSStudy object, but instead returns a
   * json object with three fields; mtblsStudy, isaInvestigation & validation.
   *
   * @param id: ID of the study to retrieve IE MTBLS99999
   */
  getStudyGeneralMetadata(id): Observable<IStudySummary> {
    return this.http
      .get<IStudySummary>(this.url.baseURL + "/studies" + "/" + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update a study's title.
   * @param body - The new title.
   * @param id - The MTBLSXYZ identifier of the study.
   * @returns Observable of response, which is the new title confirmed by the webservice.
   */
  updateTitle(body, id): Observable<{ title: string }> {
    return this.http
      .put<{ title: string }>(
        this.url.baseURL + "/studies" + "/" + id + "/title",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateAbstract(body, id): Observable<{ description: string }> {
    return this.http
      .put<{ description: string }>(
        this.url.baseURL + "/studies" + "/" + id + "/description",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }



  
}

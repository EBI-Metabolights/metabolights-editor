import { inject, Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { catchError, filter, map } from 'rxjs/operators';
import { firstValueFrom, Observable } from 'rxjs';
import { IValidationSummaryWrapper } from 'src/app/models/mtbl/mtbls/interfaces/validation-summary.interface';
import { httpOptions } from '../headers';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { BaseOverride, OverrideResponse, ValidationPhase, ValidationReportContents, Ws3Response, Ws3ValidationTask } from 'src/app/components/study/validations-v2/interfaces/validation-report.interface';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class ValidationService extends BaseConfigDependentService {

  private dnvtParams = {
    message_filter: 'NONE',
    summary_messages: true
  } // default new validation task params
  public loadingRulesMessage: string = "Loading study validation rules."

  constructor(http: HttpClient, configService: ConfigurationService, store: Store) {
      super(http, configService, store);

    }

    /**
   * Get our validation config file.
   *
   * @returns Our validations config file via the Observable.
   */
    getValidationRules(): Observable<any> {
      return this.http.get("assets/configs/validations.json").pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationReport(studyId: string): Observable<IValidationSummaryWrapper> {
      return this.http
        .get<IValidationSummaryWrapper>(
          this.url.baseURL +
            "/studies/" +
            studyId +
            "/validation-report",
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
      /**
   * Refresh validations file in the study directory. This kicks off a threaded process, so we only get a message as a string in response,
   * rather than any details of validation.
   *
   * @returns message telling the user the update process has started.
   */
    refreshValidations(studyId: string): Observable<{ success: string }> {
      return this.http
        .post<{ success: string }>(
          this.url.baseURL +
            "/ebi-internal/" +
            studyId +
            "/validate-study/update-file",
          {},
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

    overrideValidations(data, studyId): Observable<{ success: string }> {
      return this.http
        .post<{ success: string }>(
          this.url.baseURL +
            "/ebi-internal/" +
            studyId +
            "/validate-study/override",
          data,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

    getNewValidationReport(): Observable<ValidationReportContents> {
      return this.http.get<ValidationReportContents>("assets/validation-report-v2_copy.json").pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    createStudyValidationTask(proxy: boolean = false, studyId: string): Observable<Ws3Response<Ws3ValidationTask>> {
      // remove once new auth service implemented
      // const token = localStorage.getItem('jwt');
      // console.log(token)
      let headers = null;
      // write new headers impl this is annoying me
      headers = new HttpHeaders({
        //'Content-Type':  'application/json',
        accept: "application/json",
        // Authorization: `Bearer ${token}`
      });

      let valUrl = this.configService.config.ws3URL;
      if (proxy) valUrl = valUrl.replace('https://www-test.ebi.ac.uk', '')

      return this.http.post<Ws3Response<Ws3ValidationTask>>(`${valUrl}/validations/${studyId}`,"", {headers}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationV2Report(proxy: boolean = false, taskId: string = null, studyId: string): Observable<Ws3Response<Ws3ValidationTask>> {

      // remove once new auth service implemented
      const token = localStorage.getItem('jwt');
      let headers = null;
      let headersObj = {
        //'Content-Type':  'application/json',
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
      // write new headers impl this is annoying me
      let params = new HttpParams();
      for (const key in this.dnvtParams) {
        params.set(key, this.dnvtParams[key]);
      }
      if (taskId !== null) {
        headersObj['task-id'] = taskId
      }
      headers = new HttpHeaders(headersObj);
      let valUrl = this.configService.config.ws3URL;
      if (proxy) valUrl = valUrl.replace('https://www-test.ebi.ac.uk', '')

      return this.http.get<Ws3Response<Ws3ValidationTask>>(`${valUrl}/validations/${studyId}/result`, {headers, params}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationHistory(studyId: string): Observable<Ws3Response<Array<ValidationPhase>>> {
      let headers = null;
      const token = localStorage.getItem('jwt');
      // write new headers impl this is annoying me
      headers = new HttpHeaders({
        //'Content-Type':  'application/json',
        Accept: "application/json",
        // Authorization: `Bearer ${token}`
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.get<Ws3Response<Array<ValidationPhase>>>(`${valUrl}/validations/${studyId}/history`, {headers})
    }

    overrideRule(studyId: string, override: BaseOverride): Observable<Ws3Response<OverrideResponse>> {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.patch<Ws3Response<OverrideResponse>>(`${valUrl}/validation-overrides/${studyId}`, override, {headers})
    }

    getAllOverrides(studyId: string) {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.get<Ws3Response<OverrideResponse>>(`${valUrl}/validation-overrides/${studyId}`, {headers})
    }

    deleteOverride(studyId: string, overrideId: string) {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.delete<Ws3Response<OverrideResponse>>(`${valUrl}/validation-overrides/${studyId}?override_id=${overrideId}`, {headers})
    }

    getFakeValidationReportApiResponse(): Observable<Ws3Response<Ws3ValidationTask>> {
      return this.http.get<Ws3Response<Ws3ValidationTask>>(`assets/validation-api-response.json`).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

}

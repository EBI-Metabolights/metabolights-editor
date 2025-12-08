import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BaseOverride, OverrideResponse, Ws3HistoryResponse, Ws3Response, Ws3ValidationTask, Ws3ValidationTaskResponse } from 'src/app/components/study/validations-v2/interfaces/validation-report.interface';
import { Store } from '@ngxs/store';
import { httpOptions } from '../headers';

@Injectable({
  providedIn: 'root'
})
export class ValidationService extends BaseConfigDependentService {

  private dnvtParams = {
    message_filter: 'NONE',
    summary_messages: false
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

    createStudyValidationTask(proxy: boolean = false, studyId: string): Observable<Ws3ValidationTaskResponse> {

      let valUrl = this.configService.config.ws3URL;
      if (proxy) valUrl = valUrl.replace('https://www-test.ebi.ac.uk', '')
      const params = {
        run_metadata_modifiers: true
        }
      const url = `${valUrl}/submissions/v2/validations/${studyId}`;
      return this.http.post<Ws3ValidationTaskResponse>(url, "", {headers: httpOptions.headers, params}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationV2Report(proxy: boolean = false, taskId: string = null, studyId: string): Observable<Ws3ValidationTaskResponse> {
      const params = new HttpParams();
      for (const key in this.dnvtParams) {
        params.set(key, this.dnvtParams[key]);
      }
      let valUrl = this.configService.config.ws3URL;
      if (proxy) valUrl = valUrl.replace('https://www-test.ebi.ac.uk', '')
      const url = `${valUrl}/submissions/v2/validations/${studyId}/${taskId}`
      return this.http.get<Ws3ValidationTaskResponse>(url, {headers: httpOptions.headers, params}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationHistory(studyId: string): Observable<Ws3HistoryResponse> {
      const valUrl = this.configService.config.ws3URL;
      const url = `${valUrl}/submissions/v2/validations/${studyId}`;
      return this.http.get<Ws3HistoryResponse>(url, httpOptions)
    }

    overrideRule(studyId: string, override: BaseOverride): Observable<Ws3Response<OverrideResponse>> {
      const inputData = {
        overrideId: override.overrideId,
        ruleId: override.ruleId,
        sourceFile: override.sourceFile,
        sourceColumnHeader: override.sourceColumnHeader,
        sourceColumnIndex: override.sourceColumnIndex,
        update: {
          enabled: override.enabled,
          newType: override.newType,
          curator: override.curator,
          comment: override.comment
        }

      }
      const valUrl = this.configService.config.ws3URL;
      const url = `${valUrl}/curation/v2/validation-overrides/${studyId}`;
      return this.http.patch<Ws3Response<OverrideResponse>>(url, [inputData], httpOptions)
    }

    getAllOverrides(studyId: string) {
      const valUrl = this.configService.config.ws3URL;
      const url = `${valUrl}/curation/v2/validation-overrides/${studyId}`;
      return this.http.get<Ws3Response<OverrideResponse>>(url, httpOptions)
    }

    deleteOverride(studyId: string, overrideId: string) {

      const valUrl = this.configService.config.ws3URL;
      const url = `${valUrl}/curation/v2/validation-overrides/${studyId}/${overrideId}`
      return this.http.delete<Ws3Response<OverrideResponse>>(url, httpOptions)
    }

    getFakeValidationReportApiResponse(): Observable<Ws3ValidationTaskResponse> {
      return this.http.get<Ws3ValidationTaskResponse>(`assets/validation-api-response.json`).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

}

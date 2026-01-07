import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BaseOverride, OverrideResponse, Ws3HistoryResponse, Ws3Response, Ws3ValidationTask, Ws3ValidationTaskResponse } from 'src/app/components/study/validations-v2/interfaces/validation-report.interface';
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

    createStudyValidationTask(proxy: boolean = false, studyId: string): Observable<Ws3ValidationTaskResponse> {
      // remove once new auth service implemented
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
      const params = {
        run_metadata_modifiers: true
        }
      return this.http.post<Ws3ValidationTaskResponse>(`${valUrl}/submissions/v2/validations/${studyId}`,"", {headers, params}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationV2Report(proxy: boolean = false, taskId: string = null, studyId: string): Observable<Ws3ValidationTaskResponse> {

      // remove once new auth service implemented
      // const jwtTokenKey = this.configService.config.endpoint + "/jwt"
      const jwtTokenKey = "jwt"
      const token = localStorage.getItem(jwtTokenKey);
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
      headers = new HttpHeaders(headersObj);
      let valUrl = this.configService.config.ws3URL;
      if (proxy) valUrl = valUrl.replace('https://www-test.ebi.ac.uk', '')

      return this.http.get<Ws3ValidationTaskResponse>(`${valUrl}/submissions/v2/validations/${studyId}/${taskId}`, {headers, params}).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getValidationHistory(studyId: string): Observable<Ws3HistoryResponse> {
      let headers = null;
      // const jwtTokenKey = this.configService.config.endpoint + "/jwt"
      const jwtTokenKey ="jwt"
      const token = localStorage.getItem(jwtTokenKey);
      // write new headers impl this is annoying me
      headers = new HttpHeaders({
        //'Content-Type':  'application/json',
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.get<Ws3HistoryResponse>(`${valUrl}/submissions/v2/validations/${studyId}`, {headers})
    }

    overrideRule(studyId: string, override: BaseOverride): Observable<Ws3Response<OverrideResponse>> {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
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
      return this.http.patch<Ws3Response<OverrideResponse>>(`${valUrl}/curation/v2/validation-overrides/${studyId}`, [inputData], {headers})
    }

    getAllOverrides(studyId: string) {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.get<Ws3Response<OverrideResponse>>(`${valUrl}/curation/v2/validation-overrides/${studyId}`, {headers})
    }

    deleteOverride(studyId: string, overrideId: string) {
      let headers = null;
      headers = new HttpHeaders({
        Accept: "application/json",
      });
      const valUrl = this.configService.config.ws3URL;
      return this.http.delete<Ws3Response<OverrideResponse>>(`${valUrl}/curation/v2/validation-overrides/${studyId}/${overrideId}`, {headers})
    }

    getFakeValidationReportApiResponse(): Observable<Ws3ValidationTaskResponse> {
      return this.http.get<Ws3ValidationTaskResponse>(`assets/validation-api-response.json`).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

}

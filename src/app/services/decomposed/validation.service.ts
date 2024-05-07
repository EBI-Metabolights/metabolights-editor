import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IValidationSummaryWrapper } from 'src/app/models/mtbl/mtbls/interfaces/validation-summary.interface';
import { httpOptions } from '../headers';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { Select } from '@ngxs/store';
import { MtblsWs3ResponseWrapper, ValidationReportInterface } from 'src/app/components/study/validations/validations-protoype/interfaces/validation-report.interface';

@Injectable({
  providedIn: 'root'
})
export class ValidationService extends BaseConfigDependentService {

  @Select(GeneralMetadataState.id) private studyIdentifier$: Observable<string>;

  private id: string;
  public loadingRulesMessage: string = "Loading study validation rules."

  constructor(http: HttpClient, configService: ConfigurationService) {
      super(http, configService);
      this.studyIdentifier$.subscribe(
        (id) => {
          if(id !== null) this.id = id
        }
      )
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

    getValidationReport(): Observable<IValidationSummaryWrapper> {
      return this.http
        .get<IValidationSummaryWrapper>(
          this.url.baseURL +
            "/studies/" +
            this.id +
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
    refreshValidations(): Observable<{ success: string }> {
      return this.http
        .post<{ success: string }>(
          this.url.baseURL +
            "/ebi-internal/" +
            this.id +
            "/validate-study/update-file",
          {},
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

    overrideValidations(data): Observable<{ success: string }> {
      return this.http
        .post<{ success: string }>(
          this.url.baseURL +
            "/ebi-internal/" +
            this.id +
            "/validate-study/override",
          data,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

    getNewValidationReport(): Observable<ValidationReportInterface> {
      return this.http.get<ValidationReportInterface>("assets/validation-report-v2_copy.json").pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }

    getNewValidationReportWs3() {
      const token = localStorage.getItem('jwt');
      httpOptions.headers.set('Authorization', `Bearer ${token}`)
      return this.http.get<MtblsWs3ResponseWrapper>(`https://www-test.ebi.ac.uk/metabolights/staging/ws3/validation/results/${this.id}?message_filter=NONE&summary_messages=true`, httpOptions).pipe(
        map((res) => res),
        catchError(this.handleError)
      );
    }
  
}

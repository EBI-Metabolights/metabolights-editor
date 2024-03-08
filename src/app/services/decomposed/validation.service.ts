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

    
}

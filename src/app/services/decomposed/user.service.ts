import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { ConfigurationService } from 'src/app/configuration.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IStudyDetailWrapper } from 'src/app/models/mtbl/mtbls/interfaces/study-detail.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseConfigDependentService{

  constructor(http: HttpClient, configService: ConfigurationService, store: Store) {
    super(http, configService, store)
  }

  getAllStudies(): Observable<IStudyDetailWrapper> {
    return this.http
      .get<IStudyDetailWrapper>(
        this.url.baseURL + "/studies" + "/user",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }
}

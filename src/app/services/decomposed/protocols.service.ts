import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { IProtocolWrapper } from 'src/app/models/mtbl/mtbls/interfaces/protocol-wrapper.interface';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { httpOptions } from '../headers';

@Injectable({
  providedIn: 'root'
})
export class ProtocolsService extends BaseConfigDependentService {

  constructor(http: HttpClient, configService: ConfigurationService) {
    super(http, configService)
   }

  getProtocols(id): Observable<IProtocolWrapper> {
    const studyId = id ? id : id;
    return this.http
      .get<IProtocolWrapper>(
        this.url.baseURL + "/studies" + "/" + studyId + "/protocols",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateProtocol(title, body, id) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/protocols?name=" +
          title,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  saveProtocol(body, id) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + id + "/protocols",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteProtocol(title, id) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/protocols?name=" +
          title +
          "&force=false",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }



}

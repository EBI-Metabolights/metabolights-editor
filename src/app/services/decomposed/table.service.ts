import { Injectable } from '@angular/core';
import { BaseConfigDependentService } from './base-config-dependent.service';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { httpOptions } from '../headers';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService extends BaseConfigDependentService{

  constructor(http: HttpClient, configService: ConfigurationService) { 
    super(http, configService)
  }

  getTable(fileName, id): Observable<ITableWrapper> {
    return this.http
      .get<ITableWrapper>(
        this.url.baseURL + "/studies" + "/" + id + "/" + fileName,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addColumns(filename, body, id): Observable<any> {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + id + "/columns/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addRows(filename, body, id): Observable<any> {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + id + "/rows/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateRows(filename, body, id) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + id + "/rows/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteRows(filename, rowIds, id) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/rows/" +
          filename +
          "?row_num=" +
          rowIds,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateCells(filename, body, id) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + id + "/cells/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }


}

import { catchError, map, tap } from 'rxjs/operators';
import { doiWSURL } from './../globals';
import { DataService } from './../data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ICrossRefDOI } from 'src/app/models/mtbl/mtbls/interfaces/crossref-doi.interface';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from 'src/app/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class DOIService extends DataService {
  constructor(http: HttpClient, private configService: ConfigurationService) {
    super('', http);
    this.url = this.configService.config.doiWSURL;
  }

  getArticleInfo(doi): Observable<ICrossRefDOI> {
    return this.http.get<ICrossRefDOI>(this.url.article + doi).pipe(
      map((res) => this.extractArticleDetails(res)),
      catchError(this.handleError)
    );
  }

  getArticleKeyWords(doi): Observable<ICrossRefDOI> {
    return this.http
      .get<ICrossRefDOI>(this.url.article + doi)
      .pipe(catchError(this.handleError));
  }

  extractArticleDetails(data) {
    return {
      title: data.message.title[0],
      authorList: data.message.author
        .map((author) => author.family + ' ' + author.given)
        .join(', '),
    };
  }
}

import { environment } from './../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DOIWSURL } from './../globals';
import { contentHeaders } from './../headers';
import { DataService } from './../data.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DOIService extends DataService{
	constructor(http: Http) {
  	super(DOIWSURL, http);
 	}

  getArticleInfo(doi) {
    return this.http.get(this.url.article + doi).pipe(
        map(res => this.extractArticleDetails(res.json())),
        catchError(this.handleError)
    );
  }

  extractArticleDetails(data){
  	return {
  		'title': data.message.title[0],
  		'authorList': data.message.author.map( author => author.family + ' ' + author.given ).join(', ')
  	}
  }
}

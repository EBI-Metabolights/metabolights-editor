import { environment } from './../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { EuropePMCURL } from './../globals';
import { contentHeaders } from './../headers';
import { DataService } from './../data.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EuropePMCService extends DataService{
	constructor(http: Http) {
		super(EuropePMCURL, http);
	}

	getArticleInfo(doi) {
		return this.http.get(this.url.article.replace('<term>', doi)).pipe(
			map(res => this.extractArticleDetails(res.json(), doi)),
			catchError(this.handleError)
			);
	}

	extractArticleDetails(data, doi){
		let article = data.resultList.result[0];
		if(article){
			return {
				'title': article.title,
				'authorList': article.authorString,
				'authorDetails': article.authorList.author,
				'pubMedID': article.pmid,
				'doi': article.doi,
				'abstract': article.abstractText
			}
		}else{
			return  {
				'title': "",
				'authorList': "",
				'authorDetails': "",
				'pubMedID': "",
				'doi': "",
				'abstract': ""
			}
		}
		
	}
}

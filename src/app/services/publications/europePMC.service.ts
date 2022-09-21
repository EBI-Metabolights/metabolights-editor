import { catchError, map} from 'rxjs/operators';
import { EuropePMCURL } from './../globals';
import { DataService } from './../data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IEuropePMCResponseWrapper } from 'src/app/models/mtbl/mtbls/interfaces/europe-pmc-response-wrapper.interface';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from 'src/app/configuration.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service that queries the EuropePMC API for journal article information
 */
export class EuropePMCService extends DataService{

	/**
	 * Constructor for the EuropePMC service
	 * @param http HttpClient module for making the requests.
	 */
	constructor(
		http: HttpClient,
		private configService: ConfigurationService) {
			// cannot reference 'this.' within a super() call, so need to assign the url after 
			super('', http);
			this.url = this.configService.config.EuropePMCURL
	}

	/**
	 * Get Article information from EuropePMC
	 * This method returns an Observable of type any due to the way it pulls details out of the response via extractArticleDetails.
	 * It gets article information via europepmc, and assuming the first result is the correct one, pulls out the required information.
	 * @param doi Digital Object Identifier for the article
	 * @returns Selected article information as a generic javascript object via the Observable.
	 */
	getArticleInfo(doi): Observable<any> {
		return this.http.get<IEuropePMCResponseWrapper>(this.url.article.replace('<term>', doi)).pipe(
			map(res => this.extractArticleDetails(res, doi)),
			catchError(this.handleError)
			);
	}

	/**
	 * Get the keywords of an article from EuropePMC.
	 * This method returns an Observable of type string[] as it pulls the keyword array from the response, rather than
	 * returning the original response via the Observable.
	 * @param doi Digital Object Identifier for the article.
	 * @returns Keywords as string array via the Observable.
	 */
	getArticleKeyWords(doi): Observable<string[]> {
		return this.http.get<IEuropePMCResponseWrapper>(this.url.article.replace('<term>', doi)).pipe(
			map(res => res.resultList.result[0].keywordList.keyword),
			catchError(this.handleError)
		);
	}

	/**
	 * Pull out the details we need from the europePMC response, and discard the rest as it's a big wrapper of data.
	 * @param data The original EuropePMC response.
	 * @param doi Digital Object Identifier
	 * @returns The details we want in a generic javascript object.
	 */
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

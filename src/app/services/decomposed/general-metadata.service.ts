import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IStudySummary } from 'src/app/models/mtbl/mtbls/interfaces/study-summary.interface';
import { DataService } from '../data.service';
import { httpOptions } from '../headers';
import { catchError, map } from 'rxjs/operators';
import { ConfigurationService } from 'src/app/configuration.service';
import { IReleaseDate } from 'src/app/models/mtbl/mtbls/interfaces/release-date.interface';
import { IProtocolWrapper } from 'src/app/models/mtbl/mtbls/interfaces/protocol-wrapper.interface';
import { IPublication } from 'src/app/models/mtbl/mtbls/interfaces/publication.interface';
import { IPublicationWrapper } from 'src/app/models/mtbl/mtbls/interfaces/publication-wrapper.interface';
import { IPeopleWrapper } from 'src/app/models/mtbl/mtbls/interfaces/people-wrapper.interface';
import { IStudyRevision } from 'src/app/models/mtbl/mtbls/interfaces/study-summary.interface';

@Injectable({
  providedIn: 'root'
})
export class GeneralMetadataService extends DataService {

  constructor(
    http: HttpClient,
    private configService: ConfigurationService
    ) {
      super("", http);
    // Create a promise to wait for configLoaded to become true
      const configLoadedPromise = new Promise<void>((resolve, reject) => {
      const subscription = this.configService.configLoaded$.subscribe(loaded => {
          if (loaded === true) {
              resolve(); // Resolve the promise when configLoaded becomes true
              subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
            }
        });
      });

  // Await the promise to wait for configLoaded to become true
      configLoadedPromise.then(() => {
          // Initialization logic once configLoaded is true
          this.url = this.configService.config.metabolightsWSURL;

      });
}


  /**
   * This method hits our API's IsaInvestigation resource. It does not return a MTBLSStudy object, but instead returns a
   * json object with three fields; mtblsStudy, isaInvestigation & validation.
   *
   * @param id: ID of the study to retrieve IE MTBLS99999
   */
  getStudyGeneralMetadata(id): Observable<IStudySummary> {
    return this.http
      .get<IStudySummary>(this.url.baseURL + "/studies" + "/" + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update a study's title.
   * @param body - The new title.
   * @param id - The MTBLSXYZ identifier of the study.
   * @returns Observable of response, which is the new title confirmed by the webservice.
   */
  updateTitle(body, id): Observable<{ title: string }> {
    return this.http
      .put<{ title: string }>(
        this.url.baseURL + "/studies" + "/" + id + "/title",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateAbstract(body, id): Observable<{ description: string }> {
    return this.http
      .put<{ description: string }>(
        this.url.baseURL + "/studies" + "/" + id + "/description",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  changeReleaseDate(releaseDate, id): Observable<IReleaseDate> {
    return this.http
    .put<IReleaseDate>(
      this.url.baseURL + "/studies" + "/" + id + "/release-date",
      { release_date: releaseDate },
      httpOptions
    )
    .pipe(
      map(data => this.convertSnakeCaseToCamelCase(data)),
      catchError(this.handleError));
  }

  getProtocols(id): Observable<IProtocolWrapper> {
    return this.http
      .get<IProtocolWrapper>(
        this.url.baseURL + "/studies" + "/" + id + "/protocols",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getPublications(id): Observable<any> {
    return this.http
      .get<any>(
        this.url.baseURL + "/studies" + "/" + id + "/publications",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  savePublication(body, id): Observable<IPublication> {
    return this.http
      .post<IPublication>(
        this.url.baseURL + "/studies" + "/" + id + "/publications",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deletePublication(title, id) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/publications?title=" +
          title,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updatePublication(title, body, id): Observable<IPublication> {
    return this.http
      .put<IPublication>(
        this.url.baseURL +
          "/studies" +
          "/" +
          id +
          "/publications?title=" +
          title,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getPeople(id): Observable<IPeopleWrapper> {
    return this.http
      .get<IPeopleWrapper>(
        this.url.baseURL + "/studies" + "/" + id + "/contacts",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  savePerson(body, id): Observable<IPeopleWrapper> {
    return this.http
      .post<IPeopleWrapper>(
        this.url.baseURL + "/studies" + "/" + id + "/contacts",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updatePerson(email, name, body, id): Observable<any> {
    let query = "";
    if (email && email !== "" && email !== null) {
      query = "email=" + email;
    } else if (name && name !== "" && name !== null) {
      query = "full_name=" + name;
    }
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + id + "/contacts?" + query,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  makePersonSubmitter(email, id) {
    let body = null;
    if (email && email !== "" && email !== null) {
      body = {
        submitters: [
          {
            email,
          },
        ],
      };
    }

    if (body) {
      return this.http
        .post(
          this.url.baseURL + "/studies" + "/" + id + "/submitters",
          body,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }

  deletePerson(email, name, id) {
    let query = "";
    if (email && email !== "" && email !== null) {
      query = "email=" + email;
    } else if (name && name !== "" && name !== null) {
      query = "full_name=" + name;
    }
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + id + "/contacts?" + query,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

    // Status
    changeStatus(status, id) {
      return this.http
        .put(
          this.url.baseURL + "/studies" + "/" + id + "/status",
          { status },
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }

  /**
     *
     *
     * @param id: ID of the study to retrieve
     */
  createRevision(studyId: string, revisionComment: string): Observable<IStudyRevision> {

    const headerOptions = {
      headers: new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "revision-comment": revisionComment,
      }),
    };


    return this.http.post<IStudyRevision>(this.url.baseURL + "/studies" + "/" + studyId + "/revisions", {}, headerOptions)
      .pipe(catchError(this.handleError));
  }
}






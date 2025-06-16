/* eslint-disable @typescript-eslint/naming-convention */
import { catchError, map, take } from "rxjs/operators";
import { httpOptions } from "./../headers";
import { DataService } from "./../data.service";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IStudySummary } from "src/app/models/mtbl/mtbls/interfaces/study-summary.interface";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { IOntologyWrapper } from "src/app/models/mtbl/mtbls/interfaces/ontology-wrapper.interface";
import { ConfigurationService } from "src/app/configuration.service";
import { MTBLSStudy } from "src/app/models/mtbl/mtbls/mtbls-study";
import { ApiVersionInfo } from "src/app/models/mtbl/mtbls/interfaces/common";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";


interface DeleteFileDetail {
  file: string;
  status: string;
  message: string;
}

interface DeleteFilesResponse {
    errors: DeleteFileDetail[];
    deleted_files: DeleteFileDetail[];
}

// disabling this as parameter names mirror that of actual file columns
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable({
  providedIn: "root",
})
export class MetabolightsService extends DataService {

  private studyIdentifier$: Observable<string> = this.store.select(GeneralMetadataState.id);


  study: MTBLSStudy;
  id: string;

  constructor(
    http: HttpClient,
    private configService: ConfigurationService,
    private store: Store
  ) {
    super("", http);

       // Create a promise to wait for configLoaded to become true
/*        const configLoadedPromise = new Promise<void>((resolve, reject) => {
         const subscription = this.configService.configLoaded$.subscribe(loaded => {
            if (loaded===  true) {
                resolve(); // Resolve the promise when configLoaded becomes true
                subscription.unsubscribe(); // Unsubscribe to prevent memory leaks

            }
        });
    }); */

        // Create a promise to wait for configLoaded to become true
        const configLoadedPromise = new Promise<void>((resolve, reject) => {
          this.configService.configLoaded$.pipe(
              take(1) // Automatically complete after the first emission
          ).subscribe(loaded => {
              if (loaded === true) {
                  resolve(); // Resolve the promise when configLoaded becomes true
              }
          });
      });

    // Await the promise to wait for configLoaded to become true
    configLoadedPromise.then(() => {

        // Initialization logic once configLoaded is true
        this.url = this.configService.config.metabolightsWSURL;
        if (this.url.ontologyDetails.endsWith("/")) {
            this.url.ontologyDetails = this.url.ontologyDetails.slice(0, -1);
        }
        if (this.url.baseURL.endsWith("/")) {
            this.url.baseURL = this.url.baseURL.slice(0, -1);
        }
        if (this.url.guides.endsWith("/")) {
            this.url.guides = this.url.guides.slice(0, -1);
            console.log(this.url.guides)
        }
        this.setUpSubscriptionsNgxs();


    });

  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => (this.id = value));

  }


  /**
   * Gets the current access status of study ftp folder
   *
   * @returns A string indicating the Access setting (Read or Write) via the Observable.
   */
  getStudyPrivateFolderAccess(): Observable<{ Access: string }> {
    return this.http
      .get<{ Access: string }>(
        this.url.baseURL + "/studies/" + this.id + "/access",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Toggles whether the given ftp folder is readonly or not
   *
   * @returns A string indicating the new Access setting (Read or Write) via the Observable.
   */
  toggleFolderAccess(): Observable<{ Access: string }> {
    return this.http
      .put<{ Access: string }>(
        this.url.baseURL + "/studies/" + this.id + "/access/toggle",
        {},
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }


  getApiInfo(): Observable<ApiVersionInfo> {
    return this.http
      .get<ApiVersionInfo>(this.url.baseURL, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * The type on this observable is a bit of a cop out, but the API method is a trainwreck in the response it gives,
   * so it will have to do for now until we refactor the API.
   * Gets the meta-info for a given study.
   *
   * @returns The meta-info object via the observable.
   */
  getMetaInfo(): Observable<{ data: any }> {
    return this.http
      .get<{ data: any }>(
        this.url.baseURL + "/studies" + "/" + this.id + "/meta-info",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * This method hits our API's IsaInvestigation resource. It does not return a MTBLSStudy object, but instead returns a
   * json object with three fields; mtblsStudy, isaInvestigation & validation.
   *
   * @param id: ID of the study to retrieve IE MTBLS99999
   */
  getStudy(id): Observable<IStudySummary> {
    return this.http
      .get<IStudySummary>(this.url.baseURL + "/studies" + "/" + id, httpOptions)
      .pipe(catchError(this.handleError));
  }

  // Study files
  getStudyFiles(id, includeRawFiles) {
    let queryRawFiles = false;
    if (includeRawFiles) {
      queryRawFiles = includeRawFiles;
    }
    const studyId = id ? id : this.id;
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          studyId +
          "/files?include_raw_data=" +
          queryRawFiles,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * fetch a list of all files in a given study directory
   *
   * @param force: whether to force the webservice to return the list in cases of large study directories.
   */
  getStudyFilesFetch(force, readonly: boolean = true): Observable<IStudyFiles> {
    const studyId = this.id;
    if (force) {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL +
            "/studies" +
            "/" +
            studyId +
            "/files-fetch?force=true&readonlyMode=" + readonly,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    } else {
      return this.http
        .get<IStudyFiles>(
          this.url.baseURL + "/studies" + "/" + studyId + "/files-fetch",
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }


  /**
   * This is the same as the method above, except includes a few new parameters for directory listing.
   *
   * @param id MTBLS ID of the study.
   * @param include_sub_dir Include subdirectories in the study directory listing output
   * @param dir If supplied will only list the contents of that directory (if it exists)
   * @param parent Parent directory for the above parameter
   * @returns observable of a wrapper containing the studies file information.
   */
  getStudyFilesList(id, include_sub_dir, dir, parent): Observable<IStudyFiles> {
    return this.getStudyFilesListFromLocation(id, include_sub_dir, dir, parent, null);
  }

  /**
   * This is the same as the method above, except includes a few new parameters for directory listing.
   *
   * @param id MTBLS ID of the study.
   * @param include_sub_dir Include subdirectories in the study directory listing output
   * @param dir If supplied will only list the contents of that directory (if it exists)
   * @param parent Parent directory for the above parameter
   * @returns observable of a wrapper containing the studies file information.
   */
  getStudyFilesListFromLocation(id, include_sub_dir, dir, parent, location: 'study'): Observable<IStudyFiles> {
    const studyId = id ? id : this.id;
    const includeSubDir = include_sub_dir ? include_sub_dir : null;
    const directory = dir ? dir : null;
    let query = this.url.baseURL + "/studies" + "/" + studyId + "/files/tree?";
    if (includeSubDir) {
      query = query + "include_sub_dir=" + includeSubDir;
    } else {
      query = query + "include_sub_dir=false";
    }
    if (directory) {
      if (parent) {
        query = query + "&directory=" + parent + directory.file;
      } else {
        query = query + "&directory=" + directory.file;
      }
    }
    if (location) {
      query = query + "&location=" + location;
    }
    return this.http
      .get<IStudyFiles>(query, httpOptions)
      .pipe(catchError(this.handleError));
  }



  deleteStudyFiles(id, body, location, force): Observable<DeleteFilesResponse> {
    const studyId = id ? id : this.id;
    const forcequery = force ? force : false;
    const locationQuery = location ? location : "study";
    return this.http
      .post<DeleteFilesResponse>(
        this.url.baseURL +
          "/studies" +
          "/" +
          studyId +
          "/files?location=" +
          locationQuery +
          "&force=" +
          forcequery,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteStudy(id) {
    return this.http
      .delete(this.url.baseURL + "/studies" + "/" + id + "/delete", httpOptions)
      .pipe(catchError(this.handleError));
  }

  downloadURL(name, code) {
    return this.url.baseURL + this.id + "/" + name + "?token=" + code;
  }

  downloadLink(name, code) {
    if (code) {
      return (
        this.url.baseURL +
        "/studies" +
        "/" +
        this.id +
        "/download/" +
        code +
        "?file=" +
        name
      );
    }
    return (
        this.url.baseURL +
        "/studies" +
        "/" +
        this.id +
        "/download" +
        "?file=" +
        name
      );

  }

  copyFiles() {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/sync?include_raw_data=true",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  syncFiles(data) {
    return this.http
      .post(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/sync?include_raw_data=true",
        data,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Hit the OLS API for ontology search results. Since this is an external API I am typing the response as any.
   *
   * @param url The url of the EBI's OLS service, plus the query terms
   * @returns The query results via the observable.
   */
  getOntologyTerms(url): Observable<any> {
    return this.http.get(url, httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Get an exact match for an Ontology term.
   *
   * @param term The term to seek a match for
   * @param branch The starting branch of ontology to search from
   * @returns A list of Ontology objects in a wrapper via the Observable.
   */
  getExactMatchOntologyTerm(term, branch): Observable<IOntologyWrapper> {
    return this.http
      .get<IOntologyWrapper>(
        this.url.baseURL +
          "/ebi-internal" +
          "/ontology?term=" +
          term +
          "&branch=" +
          branch,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Hits the OLS API for a specific ontology term description, Since this is an external API and
   * we make little use of most of the data I am typing the response as any.
   *
   * @param url
   * @returns The term description result via the Observable.
   */
  getOntologyTermDescription(url): Observable<any> {
    return this.http.get(url, httpOptions).pipe(catchError(this.handleError));
  }

  /**
   * Hits the OLS API for a specific ontologies details, Since this is an external API and
   * we make little use of most of the data I am typing the response as any.
   *
   * @param value The ontology to search details of
   * @returns The ontology details via the Observable.
   */
  getOntologyDetails(value): Observable<any> {
    let ontologyUrl = this.url.ontologyDetails;
    if (ontologyUrl.endsWith("/") === false){
      ontologyUrl = ontologyUrl + "/";
    }
    if (value.termSource.name === undefined || value.termSource.name === "") {
      console.log("Empty ontology for accession" + value);
    }
    const url =
    ontologyUrl +
      value.termSource.name +
      "/terms/" +
      encodeURI(encodeURIComponent(value.termAccession));
    const mtblsPrefix = "http://www.ebi.ac.uk/metabolights/ontology/";
    if (value?.termSource?.name === "MTBLS" && value?.termAccession?.startsWith(mtblsPrefix)) {
      const parts = value.termAccession.split("/");

      const mtblsUrl =  this.url.baseURL
                      + "/mtbls-ontology/terms/"
                      + parts[(parts.length - 1)] ;

      return this.http.get(mtblsUrl).pipe(

        map((res: any) => {
          if (res) {
            const result = {
              description: [res.termDescription],
              iri: res.termAccessionNumber,
              label: value.annotationValue,
              ontology_name: "mtbls",
              ontology_prefix: "MTBLS",
              short_form: parts[(parts.length - 1)],
              id: parts[(parts.length - 1)].replace("_", ":"),
              annotation : {}
            };
            return result;
          }
          return {};
        }));
    }
    return this.http.get(url, httpOptions);
  }

  getValidatedMAF(annotation_file_name, assay_file_name, technology) {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/maf/validated/" +
          annotation_file_name +
          "?assay_file_name=" +
          assay_file_name +
          "&technology=" +
          technology,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateMAFEntry(annotation_file_name, body) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/maf/" +
          annotation_file_name,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addMAFEntry(annotation_file_name, body) {
    return this.http
      .post(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/maf/" +
          annotation_file_name,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteMAFEntries(annotation_file_name, rowIds) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/maf/" +
          annotation_file_name +
          "?row_num=" +
          rowIds,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  validateMAF(assay_file) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/maf/validate",
        { data: [{ assay_file_name: assay_file }] },
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Giving the Observable a type of any is a cop out, but the API method is a trainwreck,
   * with no hint at the shape of the response as it itself calls
   * our legacy java code. This should be changed as part of a refactor of the API.
   * Search for metabolite ontology information to use in the Metabolite Annotation file.
   *
   * @param term The search term to use
   * @param type The type of data to search for
   * @returns The search results via the Observable.
   */
  search(term, type): Observable<any> {
    return this.http
      .get<any>(
        this.url.baseURL +
          "/studies".replace("/studies", "") +
          "/search/" +
          type +
          "?search_value=" +
          term,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }



  /**
   * Create a new, empty study.
   *
   * @returns A StudyWrapper object containing the new study accession number as confirmation, via the Observable.
   */
  createStudy(): Observable<{ new_study: string }> {
    return this.http
      .get<{ new_study: string }>(
        this.url.baseURL + "/studies" + "/create",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  decompressFiles(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/files/unzip",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }


}

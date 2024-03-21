/* eslint-disable @typescript-eslint/naming-convention */
import { catchError, map } from "rxjs/operators";
import { httpOptions } from "./../headers";
import { DataService } from "./../data.service";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "./../../store";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { IStudySummary } from "src/app/models/mtbl/mtbls/interfaces/study-summary.interface";
import { IStudyDetailWrapper } from "src/app/models/mtbl/mtbls/interfaces/study-detail.interface";
import { IValidationSummaryWrapper } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { IProtocolWrapper } from "src/app/models/mtbl/mtbls/interfaces/protocol-wrapper.interface";
import { ITableWrapper } from "src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface";
import { IPeopleWrapper } from "src/app/models/mtbl/mtbls/interfaces/people-wrapper.interface";
import { IFactorsWrapper } from "src/app/models/mtbl/mtbls/interfaces/factor-wrapper.interface";
import { IPublicationWrapper } from "src/app/models/mtbl/mtbls/interfaces/publication-wrapper.interface";
import { IStudyDesignDescriptorWrapper } from "src/app/models/mtbl/mtbls/interfaces/study-design-descriptor-wrapper.interface";
import { IOntologyWrapper } from "src/app/models/mtbl/mtbls/interfaces/ontology-wrapper.interface";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { MTBLSStudy } from "src/app/models/mtbl/mtbls/mtbls-study";
import { ApiVersionInfo } from "src/app/models/mtbl/mtbls/interfaces/common";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select } from "@ngxs/store";



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
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study) stateStudy;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>
  

  study: MTBLSStudy;
  id: string;

  constructor(
    http: HttpClient,
    private configService: ConfigurationService,
    ngRedux?: NgRedux<IAppState>
  ) {
    super("", http);
       // Create a promise to wait for configLoaded to become true
       const configLoadedPromise = new Promise<void>((resolve, reject) => {
        const subscription = this.configService.configLoaded$.subscribe(loaded => {
            if (loaded == true) {
                resolve(); // Resolve the promise when configLoaded becomes true
                subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
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
        if (environment.useNewState) this.setUpSubscriptionsNgxs();
        else {
          this.studyIdentifier.subscribe((value) => (this.id = value));
          this.stateStudy.subscribe((value) => (this.study = value));
        }

    });

  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => (this.id = value));
    this.stateStudy.subscribe((value) => (this.study = value));
  }

  /**
   * Get our validation config file.
   *
   * @returns Our validations config file via the Observable.
   */
  // REMOVE POST STATE MIGRATION
  getValidations(): Observable<any> {
    return this.http.get("assets/configs/validations.json").pipe(
      map((res) => res),
      catchError(this.handleError)
    );
  }

  /**TODO
   * Change the two proceeding methods to return an Observable with a defined type / interface when
   * the validation refactor is completed.
   */

  /**
   * Refresh validations file in the study directory. This kicks off a threaded process, so we only get a message as a string in response,
   * rather than any details of validation.
   *
   * @returns message telling the user the update process has started.
   */
  refreshValidations(): Observable<{ success: string }> {
    return this.http
      .post<{ success: string }>(
        this.url.baseURL +
          "/ebi-internal/" +
          this.id +
          "/validate-study/update-file",
        {},
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  overrideValidations(data): Observable<{ success: string }> {
    return this.http
      .post<{ success: string }>(
        this.url.baseURL +
          "/ebi-internal/" +
          this.id +
          "/validate-study/override",
        data,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }
  /**
   * Post a new comment for a specific validation to the API.
   *
   * @param data A generic javascript object containing the comment.
   * @returns A message indicating the success or lack of thereof of saving the comment, via an Observable.
   */
  addComment(data): Observable<{ success: string }> {
    return this.http
      .post<{ success: string }>(
        this.url.baseURL +
          "/ebi-internal/" +
          this.id +
          "/validate-study/comment",
        data,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Study validation details
  getLanguageMappings() {
    let url = this.url.guides;
    if (this.url.guides.endsWith("/") === false){
      url = this.url.guides + "/";
    }
    return this.http
      .get(url + "mapping.json")
      .pipe(catchError(this.handleError));
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

  // REMOVE POST STATE MIGRATION
  getGuides(language) {
    let url = this.url.guides;
    if (this.url.guides.endsWith("/") === false){
      url = this.url.guides + "/";
    }
    return this.http
      .get(url + "I10n/" + language + ".json")
      .pipe(catchError(this.handleError));
  }

  /*Returns a list of all studies, with greater detail, for a given user. */
  // REMOVE POST STATE MIGRATION
  getAllStudies(): Observable<IStudyDetailWrapper> {
    return this.http
      .get<IStudyDetailWrapper>(
        this.url.baseURL + "/studies" + "/user",
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

  // Study title
  getTitle(id) {
    const studyId = id ? id : this.id;
    return this.http
      .get(
        this.url.baseURL + "/studies" + "/" + studyId + "/title",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates the title of a study in the DB.
   *
   * @param body The new study title
   * @returns An object containing the new study title as confirmation, via the Observable.
   */
  // REMOVE POST STATE MIGRATION
  saveTitle(body): Observable<{ title: string }> {
    return this.http
      .put<{ title: string }>(
        this.url.baseURL + "/studies" + "/" + this.id + "/title",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Update the abstract for a study.
   *
   * @param body The new abstract for the study.
   * @returns An object containing the new description as confirmation, via the Observable.
   */
  // REMOVE POST STATE MIGRATION
  saveAbstract(body): Observable<{ description: string }> {
    return this.http
      .put<{ description: string }>(
        this.url.baseURL + "/studies" + "/" + this.id + "/description",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getAbstract(id) {
    const studyId = id ? id : this.id;
    return this.http
      .get(
        this.url.baseURL + "/studies" + "/" + studyId + "/description",
        httpOptions
      )
      .pipe(
        map((res) => res["description"]), // eslint-disable-line @typescript-eslint/dot-notation
        catchError(this.handleError)
      );
  }

  /**
   * Get the list of contacts associated with a study.
   *
   * @returns The list of contacts for a given study.
   */
  getPeople(): Observable<IPeopleWrapper> {
    return this.http
      .get<IPeopleWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/contacts",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Post an updated contact or contact list. The newly updated contact or contact list is returned in the response.
   *
   * @param body The updated contact or contact list.
   * @returns Newly updated contact or contact list.
   */
  savePerson(body): Observable<IPeopleWrapper> {
    return this.http
      .post<IPeopleWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/contacts",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updatePerson(email, name, body) {
    let query = "";
    if (email && email !== "" && email !== null) {
      query = "email=" + email;
    } else if (name && name !== "" && name !== null) {
      query = "full_name=" + name;
    }
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + this.id + "/contacts?" + query,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  makePersonSubmitter(email, study) {
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
          this.url.baseURL + "/studies" + "/" + this.id + "/submitters",
          body,
          httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }

  deletePerson(email, name) {
    let query = "";
    if (email && email !== "" && email !== null) {
      query = "email=" + email;
    } else if (name && name !== "" && name !== null) {
      query = "full_name=" + name;
    }
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + this.id + "/contacts?" + query,
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

  /**
   * Retrieves publication information for a given study.
   *
   * @returns A Publication wrapper object via the Observable
   */
  getPublications(): Observable<IPublicationWrapper> {
    return this.http
      .get<IPublicationWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/publications",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  savePublication(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/publications",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updatePublication(title, body) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/publications?title=" +
          title,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deletePublication(title) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/publications?title=" +
          title,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Return the protocols (if any) for a given study
   *
   * @param id ID of the study we want to fetch protocols for IE MTBLS9999
   * @returns an observable of a list of protocol objects.
   */
  // REMOVE POST STATE MIGRATION
  getProtocols(id): Observable<IProtocolWrapper> {
    const studyId = id ? id : this.id;
    return this.http
      .get<IProtocolWrapper>(
        this.url.baseURL + "/studies" + "/" + studyId + "/protocols",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  //REMOVE POST STATE MIGRATION
  saveProtocol(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/protocols",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }


  // REMOVE POST STATE MIGRATION
  updateProtocol(title, body) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/protocols?name=" +
          title,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  deleteProtocol(title) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/protocols?name=" +
          title +
          "&force=false",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Get the study design descriptors for a study.
   *
   * @returns An object or list of objects representing study design descriptors, via the Observable.
   */
  // REMOVE POST STATE MIGRATION
  getDesignDescriptors(): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .get<IStudyDesignDescriptorWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/descriptors",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Post a new design descriptor for a study.
   *
   * @param body The new design descriptor.
   * @returns An object representing a study design descriptor, via the Observable.
   */
  // REMOVE POST STATE MIGRATION
  saveDesignDescriptor(body): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .post<IStudyDesignDescriptorWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/descriptors",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an exisiting design descriptor for a study.
   *
   * @param annotationValue The annotation value, which identifies the design descriptor to update.
   * @param body - The updated design descriptor.
   * @returns An object representing a study design descriptor, via the Observable.
   */
  updateDesignDescriptor(
    annotationValue,
    body
  ): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .put<IStudyDesignDescriptorWrapper>(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/descriptors?term=" +
          annotationValue,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a studies design descriptor.
   *
   * @param annotationValue The annotation value, which identifies the design descriptor to delete
   * @returns An object representing the now deleted study design descriptor, via the Observable.
   */
  deleteDesignDescriptor(
    annotationValue
  ): Observable<IStudyDesignDescriptorWrapper> {
    return this.http
      .delete<IStudyDesignDescriptorWrapper>(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/descriptors?term=" +
          annotationValue,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Return the factor or factors for a given study.
   *
   * @returns Either a single factor object, or a list of them.
   */
  // REMOVE POST STATE MIGRATION
  getFactors(): Observable<IFactorsWrapper> {
    return this.http
      .get<IFactorsWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/factors",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  saveFactor(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/factors",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  updateFactor(factorName, body) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/factors?name=" +
          factorName,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  deleteFactor(factorName) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/factors?name=" +
          factorName,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Study process sequences / Samples
  getProcessSequences() {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/processSequence?list_only=false",
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSamplesTable(samples_file_name) {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/samples/" +
          samples_file_name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  saveSample(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/samples",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addSamples(file, body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/samples/" + file,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteSamples(file, rows) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/rows/" +
          file +
          "?row_num=" +
          rows,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Study assays
  getAssayTable(assay_file_name) {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/assay/" +
          assay_file_name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  addAssay(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/assays",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  deleteAssay(name) {
    return this.http
      .delete(
        this.url.baseURL + "/studies" + "/" + this.id + "/assays/" + name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addAssayRow(assay_file_name, body) {
    return this.http
      .post(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/assay/" +
          assay_file_name,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateAssayRow(assay_file_name, body) {
    return this.http
      .put(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/assay/" +
          assay_file_name,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteAssayRow(assay_file_name, rowIds) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/assay/" +
          assay_file_name +
          "?row_num=" +
          rowIds,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Study MAF
  getMAF(annotation_file_name) {
    return this.http
      .get(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/maf/" +
          annotation_file_name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
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
   * Gets a file by the given name from a given study directory.
   *
   * @param file_name The filename to retrieve - will either represent a sample sheet, metabolite annotation file or an assay sheet.
   * @returns An observable of a TableWrapper object, that contains both the table rows and headers.
   */
  getTable(file_name): Observable<ITableWrapper> {
    return this.http
      .get<ITableWrapper>(
        this.url.baseURL + "/studies" + "/" + this.id + "/" + file_name,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // REMOVE POST STATE MIGRATION
  addColumns(filename, body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/columns/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  addRows(filename, body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/rows/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateRows(filename, body) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + this.id + "/rows/" + filename,
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteRows(filename, rowIds) {
    return this.http
      .delete(
        this.url.baseURL +
          "/studies" +
          "/" +
          this.id +
          "/rows/" +
          filename +
          "?row_num=" +
          rowIds,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateCells(filename, body) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + this.id + "/cells/" + filename,
        body,
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

  /* Validate an individual study via the webservice. Returns a list of section validation reports.*/
  /**
   * Validate an individual study via the webservice (as opposed to the LSF cluster).
   *
   * @param section The section to validate IE assays. Defaults to all if no argument supplied.
   * @param level The level of validation messages to return IE Success, Warning, Failure. Defaults to all if no argument supplied.
   * @returns A summary of the validation run, via the Observable.
   */
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

  decompressFiles(body) {
    return this.http
      .post(
        this.url.baseURL + "/studies" + "/" + this.id + "/files/unzip",
        body,
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Status
  changeStatus(status) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + this.id + "/status",
        { status },
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // Release date
  // REMOVE POST STATE MIGRATION
  changeReleasedate(releaseDate) {
    return this.http
      .put(
        this.url.baseURL + "/studies" + "/" + this.id + "/release-date",
        { release_date: releaseDate },
        httpOptions
      )
      .pipe(catchError(this.handleError));
  }
}

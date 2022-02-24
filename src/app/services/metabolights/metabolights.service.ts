import { catchError, map } from 'rxjs/operators';
import { MetaboLightsWSURL } from './../globals';
import { contentHeaders } from './../headers';
import { DataService } from './../data.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './../../store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IStudySummary } from 'src/app/models/mtbl/mtbls/interfaces/study-summary.interface';
import { IStudyDetailWrapper } from 'src/app/models/mtbl/mtbls/interfaces/study-detail.interface';
import { IValidationSummaryWrapper } from 'src/app/models/mtbl/mtbls/interfaces/validation-summary.interface';
import { IStudyFiles } from 'src/app/models/mtbl/mtbls/interfaces/study-files.interface';
import { IProtocolWrapper } from 'src/app/models/mtbl/mtbls/interfaces/protocol-wrapper.interface';
import { ITableWrapper } from 'src/app/models/mtbl/mtbls/interfaces/table-wrapper.interface';
import { IPeopleWrapper } from 'src/app/models/mtbl/mtbls/interfaces/people-wrapper.interface';
import { IFactorsWrapper } from 'src/app/models/mtbl/mtbls/interfaces/factor-wrapper.interface';
import { IPublicationWrapper } from 'src/app/models/mtbl/mtbls/interfaces/publication-wrapper.interface';
import { IStudyDesignDescriptorWrapper } from 'src/app/models/mtbl/mtbls/interfaces/study-design-descriptor-wrapper.interface';
import { IOntologyWrapper } from 'src/app/models/mtbl/mtbls/interfaces/ontology-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class MetabolightsService extends DataService{
  @select(state => state.study.identifier) studyIdentifier;
  id: string;

  constructor(http: HttpClient, ngRedux: NgRedux<IAppState>, router: Router) {
  	super(MetaboLightsWSURL, http);
    this.studyIdentifier.subscribe(value => this.id = value)
  }



  /**
   * Get our validation config file.
   * @returns Our validations config file via the Observable.
   */
  getValidations(): Observable<any> {
    return this.http.get( this.url.validations ).pipe(
      map(res => res),
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
   * @returns message telling the user the update process has started.
   */
  refreshValidations(): Observable<{success: string}> {
    return this.http.post<{success: string}>(this.url.baseURL + "/ebi-internal/" + this.id + "/validate-study/update-file", {}, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  overrideValidations(data): Observable<{success: string}>{
    return this.http.post<{success: string}>(this.url.baseURL + "/ebi-internal/" + this.id + "/validate-study/override", data, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }
  /**
   * Post a new comment for a specific validation to the API.
   * @param data A generic javascript object containing the comment.
   * @returns A message indicating the success or lack of thereof of saving the comment, via an Observable.
   */
  addComment(data): Observable<{success: string}> {
    return this.http.post<{success: string}>(this.url.baseURL + "/ebi-internal/" + this.id + "/validate-study/comment", data, {headers: contentHeaders }).pipe(
      catchError(this.handleError)
    )
  }

  // Study validation details
  getLanguageMappings() {
    return this.http.get( this.url.guides + "mapping.json" ).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Gets the current access status of study ftp folder
   * @returns A string indicating the Access setting (Read or Write) via the Observable.
   */
  getStudyPrivateFolderAccess(): Observable<{Access: string}>{
    return this.http.get<{Access: string}>(this.url.studiesList + "/" + this.id + "/access", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Toggles whether the given ftp folder is readonly or not
   * @returns A string indicating the new Access setting (Read or Write) via the Observable.
   */
  toggleFolderAccess(): Observable<{Access: string}>{
    return this.http.put<{Access: string}>(this.url.studiesList + "/" + this.id + "/access/toggle", {}, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  // Study validation details
  getGuides(language) {
    return this.http.get( this.url.guides + "I10n/" + language + ".json" ).pipe(
      catchError(this.handleError)
    );
  }

  /*Returns a list of all studies, with greater detail, for a given user. */
  getAllStudies(): Observable<IStudyDetailWrapper> {
    return this.http.get<IStudyDetailWrapper>(this.url.studiesList + "/user", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  info() {
    return this.http.get(this.url.baseURL, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * The type on this observable is a bit of a cop out, but the API method is a trainwreck in the response it gives, so it will have to do for now
   * until we refactor the API.
   * Gets the meta-info for a given study.
   * @returns The meta-info object via the observable.
   */
  getMetaInfo(): Observable<{data: any}>{
    return this.http.get<{data: any}>(this.url.studiesList + "/" + this.id + "/meta-info", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }


  /**
   * This method hits our API's IsaInvestigation resource. It does not return a MTBLSStudy object, but instead returns a 
   * json object with three fields; mtblsStudy, isaInvestigation & validation.
   * @param id: ID of the study to retrieve IE MTBLS99999

   */
  getStudy(id): Observable<IStudySummary> {
    return this.http.get<IStudySummary>(this.url.studiesList + "/" + id, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Study files
  getStudyFiles(id, includeRawFiles) {
    let queryRawFiles = false
    if(includeRawFiles){
      queryRawFiles = includeRawFiles
    }
    let studyId = id ? id : this.id
    return this.http.get(this.url.studiesList + "/" + studyId + "/files?include_raw_data=" + queryRawFiles, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
     );
  }

  /**
   * fetch a list of all files in a given study directory
   * @param force: whether to force the webservice to return the list in cases of large study directories.
   */
  getStudyFilesFetch(force): Observable<IStudyFiles> {
    let studyId = this.id
    if(force){
      return this.http.get<IStudyFiles>(this.url.studiesList + "/" + studyId + "/files-fetch?force=true" , { headers: contentHeaders }).pipe(
        catchError(this.handleError)
      );
    }else{
      return this.http.get<IStudyFiles>(this.url.studiesList + "/" + studyId + "/files-fetch" , { headers: contentHeaders }).pipe(
        catchError(this.handleError)
      );
    }
  }

  /**
   * This is the same as the method above, except includes a few new parameters for directory listing.
   * @param id MTBLS ID of the study.
   * @param include_sub_dir Include subdirectories in the study directory listing output
   * @param dir If supplied will only list the contents of that directory (if it exists)
   * @param parent Parent directory for the above parameter
   * @returns observable of a wrapper containing the studies file information.
   */
  getStudyFilesList(id, include_sub_dir, dir, parent): Observable<IStudyFiles> {
    let studyId = id ? id : this.id
    let includeSubDir = include_sub_dir ? include_sub_dir : null
    let directory = dir ? dir : null
    let query = this.url.studiesList + "/" + studyId + "/files/tree?"
    if(includeSubDir){
      query = query + "include_sub_dir=" + includeSubDir
    }else{
      query = query + "include_sub_dir=false"
    }
    if(directory){
      if(parent){
        query = query + "&directory=" + parent + directory.file
      }else{
        query = query + "&directory=" + directory.file
      }
    }
    return this.http.get<IStudyFiles>(query, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteStudyFiles(id, body, location, force) {
    let studyId = id ? id : this.id
    let forcequery = force ? force : false
    let locationQuery = location ? location : "study"
    return this.http.post(this.url.studiesList + "/" + studyId + "/files?location=" + locationQuery + '&force=' + forcequery, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  deleteStudy(id){
    return this.http.delete(this.url.studiesList + "/" + id + "/delete", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  downloadURL(name, code) {
    return this.url.download.replace('<study>', this.id) + "/" + name + "?token=" + code
  }

  downloadLink(name, code) {
    return this.url.studiesList + "/" + this.id + "/download/" + code + "?file=" + name;
  }

  copyFiles(){
    return this.http.get(this.url.studiesList + "/" + this.id + "/sync?include_raw_data=true", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  syncFiles(data){
    return this.http.post(this.url.studiesList + "/" + this.id + "/sync?include_raw_data=true", data, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }


  // Study title
  getTitle(id) {
    let studyId = id ? id : this.id
    return this.http.get(this.url.studiesList + "/" + studyId + "/title", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Updates the title of a study in the DB.
   * @param body The new study title
   * @returns An object containing the new study title as confirmation, via the Observable.
   */
  saveTitle(body): Observable<{title: string}> {
    return this.http.put<{title: string}>(this.url.studiesList + "/" + this.id + "/title", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Update the abstract for a study.
   * @param body The new abstract for the study.
   * @returns An object containing the new description as confirmation, via the Observable.
   */
  saveAbstract(body): Observable<{description: string}> {
    return this.http.put<{description: string}>(this.url.studiesList + "/" + this.id + "/description", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  getAbstract(id) {
    let studyId = id ? id : this.id
    return this.http.get(this.url.studiesList + "/" + studyId + "/description", { headers: contentHeaders }).pipe(
      map(res => res['description']),
      catchError(this.handleError)
      );
  }

  /**
   * Get the list of contacts associated with a study.
   * @returns The list of contacts for a given study.
   */
  getPeople(): Observable<IPeopleWrapper>{
    return this.http.get<IPeopleWrapper>(this.url.studiesList + "/" + this.id + "/contacts", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Post an updated contact or contact list. The newly updated contact or contact list is returned in the response.
   * @param body The updated contact or contact list.
   * @returns Newly updated contact or contact list.
   */
  savePerson(body): Observable<IPeopleWrapper> {
    return this.http.post<IPeopleWrapper>(this.url.studiesList + "/" + this.id + "/contacts", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updatePerson(email, name, body) {
    let query = ""
    if(email && email!= '' && email != null){
      query = "email=" + email
    }else if(name && name != '' && name != null){
      query = "full_name=" + name
    }
    return this.http.put(this.url.studiesList + "/" + this.id + "/contacts?" + query, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  makePersonSubmitter(email, study) {
    let body = null
    if(email && email!= '' && email != null){
      body  = {
        "submitters": [
          {
            "email": email
          }
        ]
      }
    }

    if(body){
      return this.http.post(this.url.studiesList + "/" + this.id + "/submitters", body, { headers: contentHeaders }).pipe(
        catchError(this.handleError)
      );
    }
  }

  deletePerson(email, name) {
    let query = ""
    if(email && email!= '' && email != null){
      query = "email=" + email
    }else if(name && name != '' && name != null){
      query = "full_name=" + name
    }
    return this.http.delete(this.url.studiesList + "/" + this.id + "/contacts?" + query, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Hit the OLS API for ontology search results. Since this is an external API I am typing the response as any.
   * @param url The url of the EBI's OLS service, plus the query terms
   * @returns The query results via the observable.
   */
  getOntologyTerms(url): Observable<any>{
    return this.http.get(url, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Get an exact match for an Ontology term.
   * @param term The term to seek a match for
   * @param branch The starting branch of ontology to search from
   * @returns A list of Ontology objects in a wrapper via the Observable.
   */  
  getExactMatchOntologyTerm(term, branch): Observable<IOntologyWrapper>{
    return this.http.get<IOntologyWrapper>(this.url.studiesList.replace("studies", "ebi-internal") + "/ontology?term=" + term + "&branch=" + branch, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Hits the OLS API for a specific ontology term description, Since this is an external API and we make little use of most of the data I am
   * typing the response as any.
   * @param url 
   * @returns The term description result via the Observable.
   */
  getOntologyTermDescription(url): Observable<any>{
    return this.http.get(url, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Hits the OLS API for a specific ontologies details, Since this is an external API and we make little use of most of the data I am
   * typing the response as any.   
   * @param value The ontology to search details of
   * @returns The ontology details via the Observable.
   */
  getOntologyDetails(value): Observable<any>{
    let url = this.url.ontologyDetails + value.termSource.name + '/terms/' + encodeURI(encodeURIComponent(value.termAccession))
    return this.http.get(url, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Retrieves publication information for a given study.
   * @returns A Publication wrapper object via the Observable
   */
  getPublications(): Observable<IPublicationWrapper> {
    return this.http.get<IPublicationWrapper>(this.url.studiesList + "/" + this.id + "/publications", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  savePublication(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/publications", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updatePublication(title, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/publications?title=" + title, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deletePublication(title) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/publications?title=" + title, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Return the protocols (if any) for a given study
   * @param id ID of the study we want to fetch protocols for IE MTBLS9999
   * @returns an observable of a list of protocol objects.
   */
  getProtocols(id): Observable<IProtocolWrapper> {
    let studyId = id ? id : this.id
    return this.http.get<IProtocolWrapper>(this.url.studiesList + "/" + studyId + "/protocols", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  saveProtocol(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/protocols", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateProtocol(title, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/protocols?name=" + title, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteProtocol(title) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/protocols?name=" + title + "&force=false", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Get the study design descriptors for a study.
   * @returns An object or list of objects representing study design descriptors, via the Observable.
   */
  getDesignDescriptors(): Observable<IStudyDesignDescriptorWrapper> {
    return this.http.get<IStudyDesignDescriptorWrapper>(this.url.studiesList + "/" + this.id + "/descriptors", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Post a new design descriptor for a study.
   * @param body The new design descriptor.
   * @returns An object representing a study design descriptor, via the Observable.
   */
  saveDesignDescriptor(body): Observable<IStudyDesignDescriptorWrapper> {
    return this.http.post<IStudyDesignDescriptorWrapper>(this.url.studiesList + "/" + this.id + "/descriptors", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Update an exisiting design descriptor for a study.
   * @param annotationValue The annotation value, which identifies the design descriptor to update.
   * @param body - The updated design descriptor.
   * @returns An object representing a study design descriptor, via the Observable.
   */
  updateDesignDescriptor(annotationValue, body): Observable<IStudyDesignDescriptorWrapper> {
    return this.http.put<IStudyDesignDescriptorWrapper>(this.url.studiesList + "/" + this.id + "/descriptors?term=" + annotationValue, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Delete a studies design descriptor.
   * @param annotationValue The annotation value, which identifies the design descriptor to delete
   * @returns An object representing the now deleted study design descriptor, via the Observable.
   */
  deleteDesignDescriptor(annotationValue): Observable<IStudyDesignDescriptorWrapper> {
    return this.http.delete<IStudyDesignDescriptorWrapper>(this.url.studiesList + "/" + this.id + "/descriptors?term=" + annotationValue, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Return the factor or factors for a given study. 
   * @returns Either a single factor object, or a list of them.
   */
  getFactors(): Observable<IFactorsWrapper> {
    return this.http.get<IFactorsWrapper>(this.url.studiesList + "/" + this.id + "/factors", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  saveFactor(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/factors", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateFactor(factorName, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/factors?name=" + factorName, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteFactor(factorName) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/factors?name=" + factorName, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Study process sequences / Samples
  getProcessSequences(){
    return this.http.get(this.url.studiesList + "/" + this.id + "/processSequence?list_only=false", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  getSamplesTable(samples_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/samples/" + samples_file_name, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  saveSample(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/samples", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addSamples(file, body){
    return this.http.post(this.url.studiesList + "/" + this.id + "/samples/" + file, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteSamples(file, rows){
    return this.http.delete(this.url.studiesList + "/" + this.id + "/rows/" + file + "?row_num=" + rows, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Study assays
  getAssayTable(assay_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addAssay(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/assays", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteAssay(name) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/assays/" + name, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addAssayRow(assay_file_name, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateAssayRow(assay_file_name, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteAssayRow(assay_file_name, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Study MAF
  getMAF(annotation_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  getValidatedMAF(annotation_file_name, assay_file_name, technology) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/maf/validated/" + annotation_file_name + "?assay_file_name=" + assay_file_name + "&technology=" + technology, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateMAFEntry(annotation_file_name, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addMAFEntry(annotation_file_name, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteMAFEntries(annotation_file_name, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  validateMAF(assay_file){
    return this.http.post(this.url.studiesList + "/" + this.id + "/maf/validate", {"data": [{ "assay_file_name": assay_file }]},{ headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Giving the Observable a type of any is a cop out, but the API method is a trainwreck, with no hint at the shape of the response as it itself calls 
   * our legacy java code. This should be changed as part of a refactor of the API.
   * Search for metabolite ontology information to use in the Metabolite Annotation file.
   * @param term The search term to use
   * @param type The type of data to search for
   * @returns The search results via the Observable.
   */
  search(term, type): Observable<any> {
    return this.http.get<any>(this.url.studiesList.replace("/studies", "") + "/search/" + type + "?search_value=" + term , { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Gets a file by the given name from a given study directory.
   * @param file_name The filename to retrieve - will either represent a sample sheet, metabolite annotation file or an assay sheet.
   * @returns An observable of a TableWrapper object, that contains both the table rows and headers.
   */
  getTable(file_name): Observable<ITableWrapper> {
    return this.http.get<ITableWrapper>(this.url.studiesList + "/" + this.id + "/" + file_name, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addColumns(filename, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/columns/" + filename, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  addRows(filename, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/rows/" + filename, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateRows(filename, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/rows/" + filename, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  deleteRows(filename, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/rows/" + filename + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  updateCells(filename, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/cells/" + filename, body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /**
   * Create a new, empty study.
   * @returns A StudyWrapper object containing the new study accession number as confirmation, via the Observable.
   */
  createStudy(): Observable<{new_study: string}> {
    return this.http.get<{new_study: string}>(this.url.studiesList + "/create", { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  /* Validate an individual study via the webservice. Returns a list of section validation reports.*/
  /**
   * Validate an individual study via the webservice (as opposed to the LSF cluster).
   * @param section The section to validate IE assays. Defaults to all if no argument supplied.
   * @param level The level of validation messages to return IE Success, Warning, Failure. Defaults to all if no argument supplied.
   * @returns A summary of the validation run, via the Observable.
   */
  validateStudy(section, level): Observable<IValidationSummaryWrapper> {
    if(section == '' || !section){
      section = 'all'
    }
    if(level == '' || !level){
      level = 'all'
    }
    return this.http.get<IValidationSummaryWrapper>(this.url.studiesList + "/" + this.id + "/validate-study?section=" + section + "&level=" + level , { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }

  decompressFiles(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/files/unzip", body, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Status
  changeStatus(status){
     return this.http.put(this.url.studiesList + "/" + this.id + "/status", { 'status' : status}, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
      );
  }

  // Release date
  changeReleasedate(releaseDate){
     return this.http.put(this.url.studiesList + "/" + this.id + "/release-date", { 'release_date' : releaseDate}, { headers: contentHeaders }).pipe(
      catchError(this.handleError)
    );
  }
}

import { environment } from './../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { MetaboLightsWSURL } from './../globals';
import { contentHeaders } from './../headers';
import { DataService } from './../data.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './../../store';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MetabolightsService extends DataService{
  @select(state => state.study.identifier) studyIdentifier;
  id: string;

  constructor(http: Http, ngRedux: NgRedux<IAppState>, router: Router) {
  	super(MetaboLightsWSURL, http);
    this.studyIdentifier.subscribe(value => this.id = value)
  }

  // Study validation details
  getValidations() {
    return this.http.get( this.url.validations ).pipe(
      map(res => res.json()),
      catchError(this.handleError)
    );
  }

  // Studies list
  getAllStudies() {
    return this.http.get(this.url.studiesList + "/user", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  info() {
    return this.http.get(this.url.baseURL, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  
  // Study ISA object
  getStudy(id) {
    return this.http.get(this.url.studiesList + "/" + id, { headers: contentHeaders }).pipe(
      map(res => res.json()),
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
      map(res => res.json()),
      catchError(this.handleError)
     );
  }

  // Study files list
  getStudyFilesList(id) {
    let studyId = id ? id : this.id
    return this.http.get(this.url.studiesList + "/" + studyId + "/files/tree?include_sub_dir=false", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }



  deleteStudyFiles(id, body, location, force) {
    let studyId = id ? id : this.id
    let forcequery = force ? force : false
    let locationQuery = location ? location : false
    return this.http.post(this.url.studiesList + "/" + studyId + "/files?location=" + locationQuery + '&force=' + forcequery, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
    );
  }

  downloadURL(name, code) {
    return this.url.download.replace('<study>', this.id) + "/" + name + "?token=" + code
  }

  copyFiles(){
    return this.http.get(this.url.studiesList + "/" + this.id + "/sync?include_raw_data=true", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }


  // Study title
  getTitle(id) {
    let studyId = id ? id : this.id 
    return this.http.get(this.url.studiesList + "/" + studyId + "/title", { headers: contentHeaders }).pipe(
      map(res => res.json().title),
      catchError(this.handleError)
      );
  }

  saveTitle(body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/title", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study abstract
  saveAbstract(body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/description", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getAbstract(id) {
    let studyId = id ? id : this.id 
    return this.http.get(this.url.studiesList + "/" + studyId + "/description", { headers: contentHeaders }).pipe(
      map(res => res.json().description),
      catchError(this.handleError)
      );
  }

  // Study people
  getPeople() {
    return this.http.get(this.url.studiesList + "/" + this.id + "/contacts", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  savePerson(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/contacts", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
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
      map(res => res.json()),
      catchError(this.handleError)
    );
  }

  deletePerson(email, name) {
    let query = ""
    if(email && email!= '' && email != null){
      query = "email=" + email
    }else if(name && name != '' && name != null){
      query = "full_name=" + name
    }
    return this.http.delete(this.url.studiesList + "/" + this.id + "/contacts?" + query, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study Ontology
  getOntologyTerms(url){
    return this.http.get(url, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getOntologyTermDescription(url){
    return this.http.get(url, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getOntologyDetails(value){
    let url = this.url.ontologyDetails + value.termSource.name + '/terms/' + encodeURI(encodeURIComponent(value.termAccession))
    return this.http.get(url, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study Publications
  getPublications() {
    return this.http.get(this.url.studiesList + "/" + this.id + "/publications", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  savePublication(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/publications", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updatePublication(title, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/publications?title=" + title, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deletePublication(title) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/publications?title=" + title, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study Protocols
  getProtocols(id) {
    let studyId = id ? id : this.id 
    return this.http.get(this.url.studiesList + "/" + studyId + "/protocols", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  saveProtocol(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/protocols", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateProtocol(title, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/protocols?name=" + title, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteProtocol(title) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/protocols?name=" + title, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study design descriptors
  getDesignDescriptors() {
    return this.http.get(this.url.studiesList + "/" + this.id + "/descriptors", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  saveDesignDescriptor(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/descriptors", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateDesignDescriptor(annotationValue, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/descriptors?term=" + annotationValue, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteDesignDescriptor(annotationValue) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/descriptors?term=" + annotationValue, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study factors
  getFactors() {
    return this.http.get(this.url.studiesList + "/" + this.id + "/factors", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  saveFactor(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/factors", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateFactor(factorName, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/factors?name=" + factorName, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteFactor(factorName) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/factors?name=" + factorName, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study process sequences / Samples
  getProcessSequences(){
    return this.http.get(this.url.studiesList + "/" + this.id + "/processSequence?list_only=false", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getSamplesTable(samples_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/samples/" + samples_file_name, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  saveSample(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/samples", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addSamples(file, body){
    return this.http.post(this.url.studiesList + "/" + this.id + "/samples/" + file, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteSamples(file, rows){
    return this.http.delete(this.url.studiesList + "/" + this.id + "/rows/" + file + "?row_num=" + rows, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study assays
  getAssayTable(assay_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addAssay(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/assays", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteAssay(name) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/assays/" + name, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addAssayRow(assay_file_name, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateAssayRow(assay_file_name, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteAssayRow(assay_file_name, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/assay/" + assay_file_name + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Study MAF
  getMAF(annotation_file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getValidatedMAF(annotation_file_name, assay_file_name, technology) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/maf/validated/" + annotation_file_name + "?assay_file_name=" + assay_file_name + "&technology=" + technology, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateMAFEntry(annotation_file_name, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addMAFEntry(annotation_file_name, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteMAFEntries(annotation_file_name, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/maf/" + annotation_file_name + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  search(term, type) {
    return this.http.get(this.url.studiesList.replace("/studies", "") + "/search/" + type + "?search_value=" + term , { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  getTable(file_name) {
    return this.http.get(this.url.studiesList + "/" + this.id + "/" + file_name, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addColumns(filename, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/columns/" + filename, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  addRows(filename, body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/rows/" + filename, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateRows(filename, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/rows/" + filename, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  deleteRows(filename, rowIds) {
    return this.http.delete(this.url.studiesList + "/" + this.id + "/rows/" + filename + "?row_num=" + rowIds, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  updateCells(filename, body) {
    return this.http.put(this.url.studiesList + "/" + this.id + "/cells/" + filename, body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // create study
  createStudy() {
    return this.http.get(this.url.studiesList + "/create", { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }

  // Validate study
  validateStudy(section, level) {
    if(section == '' || !section){
      section = 'all'
    }
    if(level == '' || !level){
      level = 'all'
    }
    return this.http.get(this.url.studiesList + "/" + this.id + "/validate-study?section=" + section + "&level=" + level , { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
    );
  }

  decompressFiles(body) {
    return this.http.post(this.url.studiesList + "/" + this.id + "/files/unzip", body, { headers: contentHeaders }).pipe(
      map(res => res.json()),
      catchError(this.handleError)
      );
  }
}

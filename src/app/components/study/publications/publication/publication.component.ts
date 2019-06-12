import { EditorService } from '../../../../services/editor.service';
import { DOIService } from '../../../../services/publications/doi.service';
import { EuropePMCService } from '../../../../services/publications/europePMC.service';
import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MTBLSComment } from './../../../../models/mtbl/mtbls/common/mtbls-comment';
import { Ontology } from './../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from './../../../../models/mtbl/mtbls/mtbls-publication';
import { trigger, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidateRules } from './publication.validator';
import { NgRedux,select } from '@angular-redux/store';
import { IAppState } from '../../../../store';
import { OntologyComponent } from './../../ontology/ontology.component';
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import * as toastr from 'toastr';

@Component({
	selector: 'mtbls-publication',
	templateUrl: './publication.component.html',
	styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
	@Input('value') publication: any;
	@select(state => state.study.validations) studyValidations: any

	@ViewChild(OntologyComponent) statusComponent: OntologyComponent;

	form: FormGroup;
	isFormBusy: boolean = false;
	addNewPublication: boolean = false;

	validations: any;
	validationsId = 'publications.publication';

	isModalOpen: boolean = false;
	isTimeLineModalOpen: boolean = false;
	isDeleteModalOpen: boolean = false;
	isUpdateTitleModalOpen: boolean = false;
	isUpdateAbstractModalOpen: boolean = false;

	publicationAbstract: string = '';

	constructor( private fb: FormBuilder, private doiService: DOIService, private europePMCService: EuropePMCService, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) { 
		this.studyValidations.subscribe(value => { 
      		this.validations = value;
    	});
	}

	ngOnInit() {
		if (this.publication == null){
			this.addNewPublication = true
		}
	}

	onChanges(value){
		this.form.markAsDirty();
	}

	showHistory(){
		this.isModalOpen = false
		this.isTimeLineModalOpen = true
	}

	closeHistory(){
		this.isTimeLineModalOpen = false
		this.isModalOpen = true
	}

	openModal() {
		this.initialiseForm()
		this.isModalOpen = true
		this.publicationAbstract = '';
		this.getAbstract()
	}

	confirmDelete(){
		this.isModalOpen = false
		this.isDeleteModalOpen = true
	}

	closeDelete(){
		this.isDeleteModalOpen = false
		this.isModalOpen = true
	}

	confirmTitleUpdate(){
		this.isModalOpen = false
		this.isUpdateTitleModalOpen = true
	}

	confirmAbstractUpdate(){
		this.isModalOpen = false
		this.isUpdateAbstractModalOpen = true
	}

	closeUpdateTitleModal(){
		this.isUpdateTitleModalOpen = false
		this.isModalOpen = true
	}

	closeUpdateAbstractModal(){
		this.isUpdateAbstractModalOpen = false;
		this.isModalOpen = true;
	}

	updateStudyTitle(){
		this.editorService.saveTitle( { 'title': this.getFieldValue('title')}).subscribe( res => {
			this.ngRedux.dispatch({ type: 'SET_STUDY_TITLE', body: res})
			toastr.success('Title updated.', "Success", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			})
			this.closeUpdateTitleModal();
		})
	}

	getAbstract(){
		let doi = this.getFieldValue('doi').replace('http://dx.doi.org/','')
		if(doi != ''){
			this.europePMCService.getArticleInfo('DOI:' + doi.replace('http://dx.doi.org/','')).subscribe( article => {
	      		if(article.doi == doi){
	      			this.publicationAbstract = article.abstract;
	      		}
	      	})
		}else{
			let pubMedID = this.getFieldValue('pubMedID')
			if(pubMedID != ''){
				this.europePMCService.getArticleInfo('(SRC:MED AND EXT_ID:' + pubMedID + ")").subscribe( article => {
					this.publicationAbstract = article.abstract;
	      		})
			}
		}
	}

	getArticleFromDOI() {
		this.publicationAbstract = '';
		let doi = this.getFieldValue('doi').replace('http://dx.doi.org/','')
		this.setFieldValue('doi', doi);
		let doiURL = 'http://dx.doi.org/' + doi
		if(doi != ''){
			this.doiService.getArticleInfo(doiURL).subscribe( article => {
				this.setFieldValue('title', article.title.trim());
				this.setFieldValue('authorList', article.authorList.trim());
				this.statusComponent.setValue("Published");
	      	})
	      	this.europePMCService.getArticleInfo('DOI:' + doi.replace('http://dx.doi.org/','')).subscribe( article => {
	      		if(article.doi == doi){
	      			this.setFieldValue('pubMedID', article.pubMedID.trim());
	      			this.publicationAbstract = article.abstract;
	      		}
	      	})
		}
	}

	getArticleFromPubMedID() {
		this.publicationAbstract = '';
		let pubMedID = this.getFieldValue('pubMedID')
		if(pubMedID != ''){
			this.europePMCService.getArticleInfo('(SRC:MED AND EXT_ID:' + pubMedID + ")").subscribe( article => {
	      		this.setFieldValue('title', article.title.trim());
				this.setFieldValue('authorList', article.authorList.trim());
				this.setFieldValue('doi', article.doi.trim());
				this.publicationAbstract = article.abstract;
	      	})
		}
	}

	initialiseForm() {
		this.isFormBusy = false;

		if(this.publication == null){
			let mtblsPublication = new MTBLSPublication();
			this.publication = mtblsPublication
		}

		this.form = this.fb.group({
			pubMedID:  [ this.publication.pubMedID, ValidateRules('pubMedID', this.fieldValidation('pubMedID'))],
			doi:  [ this.publication.doi, ValidateRules('doi', this.fieldValidation('doi'))],
			authorList:  [ this.publication.authorList, ValidateRules('authorList', this.fieldValidation('authorList'))],
			title:  [ this.publication.title, ValidateRules('title', this.fieldValidation('title'))]
		});
	}

	updateStudyAbstract(){
		this.editorService.saveAbstract( { 'description': this.publicationAbstract }).subscribe( res => {
			this.ngRedux.dispatch({ type: 'SET_STUDY_ABSTRACT', body: res})
			toastr.success('Study abstract updated.', "Success", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			});
			this.closeUpdateAbstractModal();
		})
	}

	save() {
		if(this.statusComponent.values[0] == undefined){
			toastr.warning('Publication status cannot be empty', "Warning", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			});
		}else{
			this.isFormBusy = true;
			if(!this.addNewPublication){
				this.editorService.updatePublication(this.publication.title, this.compileBody()).subscribe( res => {
					this.updatePublications(res, 'Publication updated.')
				}, err => {
					this.isFormBusy = false
				});
			}else{
				this.editorService.savePublication(this.compileBody()).subscribe( res => {
					this.updatePublications(res, 'Publication saved.')
					this.isModalOpen = false
				}, err => {
					this.isFormBusy = false
				});
			}
		}
	}

	delete() {
		this.editorService.deletePublication(this.publication.title).subscribe( res => {
				this.updatePublications(res, 'Publication deleted.')
				this.isDeleteModalOpen = false
				this.isModalOpen = false
			}, err => {
				this.isFormBusy = false
		});
	}

	updatePublications(data, message){
		this.editorService.getPublications().subscribe(data => {
			this.form.markAsPristine()
			this.initialiseForm();
			this.isModalOpen = false;

			toastr.success( message, "Success", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			});
		})		
	}

	compileBody() {
		let mtblPublication = new MTBLSPublication();
		mtblPublication.title = this.getFieldValue('title');
		mtblPublication.authorList = this.getFieldValue('authorList');
		mtblPublication.doi = this.getFieldValue('doi');
		mtblPublication.pubMedID = this.getFieldValue('pubMedID');
		mtblPublication.comments = []
		let jsonConvert: JsonConvert = new JsonConvert();
		mtblPublication.status = jsonConvert.deserializeObject(this.statusComponent.values[0], Ontology)
		return { "publication" : mtblPublication.toJSON()}
	}

	closeModal() {
		this.isModalOpen = false
	}

	get validation() {
		if(this.validationsId.includes(".")){
			var arr = this.validationsId.split(".");
			let tempValidations = JSON.parse(JSON.stringify(this.validations));;
			while (arr.length && (tempValidations = tempValidations[arr.shift()]));
			return tempValidations;
		}
		return this.validations[this.validationsId];
	}

	fieldValidation(fieldId) {
		return this.validation[fieldId]
	}

	getFieldValue(name){
		return this.form.get(name).value;
	}

	setFieldValue(name, value){
		return this.form.get(name).setValue(value);
	}

}

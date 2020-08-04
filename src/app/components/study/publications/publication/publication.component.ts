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
import { MTBLSPerson } from './../../../../models/mtbl/mtbls/mtbls-person';

@Component({
	selector: 'mtbls-publication',
	templateUrl: './publication.component.html',
	styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
	@Input('value') publication: any;
	@select(state => state.study.validations) studyValidations: any

	@ViewChild(OntologyComponent) statusComponent: OntologyComponent;
	
	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

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
	isImportAuthorsModalOpen: boolean = false;

	manuscriptAuthors: any = null;

	publicationAbstract: string = '';

	constructor( private fb: FormBuilder, private doiService: DOIService, private europePMCService: EuropePMCService, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) { 
		this.studyValidations.subscribe(value => { 
      		this.validations = value;
		});
		this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
	}

	openImportAuthorsModal(){
		if(!this.isReadOnly){
			this.getAuthorsFromDOI()
			this.isModalOpen = false;
			this.isImportAuthorsModalOpen = true;
		}
	}

	closeImportAuthor(){
		this.isModalOpen = true;
		this.isImportAuthorsModalOpen = false;
	}

	saveAuthors(){
		if(!this.isReadOnly){
			let authorsA = []
			this.manuscriptAuthors.forEach( author => {
				if(author.checked){
					authorsA.push(this.compileAuthor(author))
				}
			})

			this.editorService.savePerson({'contacts': authorsA}).subscribe( res => {
				toastr.success('Authors imported.', "Success", {
					"timeOut": "2500",
					"positionClass": "toast-top-center",
					"preventDuplicates": true,
					"extendedTimeOut": 0,
					"tapToDismiss": false
				})
			}, err => {
				toastr.error('Failed to import authors.', "Error", {
					"timeOut": "2500",
					"positionClass": "toast-top-center",
					"preventDuplicates": true,
					"extendedTimeOut": 0,
					"tapToDismiss": false
				})
			});
		}
	}

	compileAuthor(author){
		let jsonConvert: JsonConvert = new JsonConvert();
		let mtblPerson = new MTBLSPerson();
		mtblPerson.lastName = author.lastName
		mtblPerson.firstName = author.firstName
		mtblPerson.midInitials = ""
		mtblPerson.email = ""
		mtblPerson.phone = ""
		mtblPerson.fax = ""
		mtblPerson.address = ""
		mtblPerson.affiliation = author.affiliation ? author.affiliation : "";
		let role = jsonConvert.deserializeObject(JSON.parse('{"annotationValue":"Author","comments":[],"termAccession":"http://purl.obolibrary.org/obo/NCIT_C42781","termSource":{"comments":[],"description":"NCI Thesaurus OBO Edition","file":"http://purl.obolibrary.org/obo/ncit.owl","ontology_name":"NCIT","provenance_name":"NCIT","version":"18.10e"}}'), Ontology)
		mtblPerson.roles.push(role)
		return mtblPerson.toJSON()
	  }
	

	getAuthorsFromDOI() {
		this.publicationAbstract = '';
		let doi = this.getFieldValue('doi').replace('http://dx.doi.org/','')
		this.setFieldValue('doi', doi);
		let doiURL = 'http://dx.doi.org/' + doi
		if(doi != ''){
			this.europePMCService.getArticleInfo('DOI:' + doi.replace('http://dx.doi.org/','')).subscribe( article => {
				this.manuscriptAuthors = article['authorDetails']
	      	})
		}
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
		if(!this.isReadOnly){
			this.initialiseForm()
			this.isModalOpen = true
			this.publicationAbstract = '';
			this.getAbstract()
		}
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
		if(!this.isReadOnly){
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
	}

	getAbstract(){
		let doi = this.getFieldValue('doi').replace('http://dx.doi.org/','')
		if(doi != ''){
			this.europePMCService.getArticleInfo('DOI:' + doi.replace('http://dx.doi.org/','')).subscribe( article => {
	      		if(article.doi == doi){
	      			this.publicationAbstract = article.abstract;
	      		}
	      	}, error => {
	      		this.isFormBusy = false
	      	})
		}else{
			let pubMedID = this.getFieldValue('pubMedID')
			if(pubMedID != ''){
				this.europePMCService.getArticleInfo('(SRC:MED AND EXT_ID:' + pubMedID + ")").subscribe( article => {
					this.publicationAbstract = article.abstract;
	      		}, error => {
	      			this.isFormBusy = false
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
		if(!this.isReadOnly){
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
	}

	updateStudyAbstract(){
		if(!this.isReadOnly){
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
			}, error => {
				this.isFormBusy = false
			})
		}
	}

	save() {
		if(!this.isReadOnly){
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
	}

	delete() {
		if(!this.isReadOnly){
			this.editorService.deletePublication(this.publication.title).subscribe( res => {
					this.updatePublications(res, 'Publication deleted.')
					this.isDeleteModalOpen = false
					this.isModalOpen = false
				}, err => {
					this.isFormBusy = false
			});
		}
	}

	updatePublications(data, message){
		if(!this.isReadOnly){
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

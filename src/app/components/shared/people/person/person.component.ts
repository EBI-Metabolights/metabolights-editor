import { EditorService } from '../../../../services/editor.service';
import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MTBLSComment } from '../../../../models/mtbl/mtbls/common/mtbls-comment';
import { Ontology } from '../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPerson } from '../../../../models/mtbl/mtbls/mtbls-person';
import { trigger, style, animate, transition } from '@angular/animations';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidateRules } from './person.validator';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../../store';
import { tassign } from 'tassign'; 
import * as toastr from 'toastr';

import {JsonConvert, OperationMode, ValueCheckingMode} from "json2typescript"

import { OntologyComponent } from '../../../study/ontology/ontology.component';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'mtbls-person',
	templateUrl: './person.component.html',
	styleUrls: ['./person.component.css'],
	animations: [
	trigger(
		'enterAnimation', [
		transition(':enter', [
			style({transform: 'translateX(100%)', opacity: 0}),
			animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
			]),
		transition(':leave', [
			style({transform: 'translateX(0)', opacity: 1}),
			animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
			])
		]
		)
	]
})
export class PersonComponent implements OnInit {

	@Input('value') person: MTBLSPerson;
	@select(state => state.study.validations) studyValidations;
	@select(state => state.study.identifier) studyIdentifier;

	@ViewChild(OntologyComponent) rolesComponent: OntologyComponent;

	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

	validations: any = {};

	requestedStudy: string = null;

	form: FormGroup;
	showAdvanced: boolean = false;
	isFormBusy: boolean = false;

	isApproveSubmitterModalOpen: boolean = false;

	isModalOpen: boolean = false;
	addNewPerson: boolean = false;
	isTimeLineModalOpen: boolean = false;
	initialEmail: string = '';
	isDeleteModalOpen: boolean = false;
	roleError: boolean = false;

	options: string[] = ['One', 'Two', 'Three'];

	validationsId = 'people.person';
	
	constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) { 
		if (!environment.isTesting) {
			this.setUpSubscriptions();
		}
	}

	setUpSubscriptions() {
		this.studyValidations.subscribe(value => { 
			this.validations = value;
		});
		this.readonly.subscribe(value => { 
			if(value != null){
				if(value){
					this.isReadOnly = value
				}else{
					this.isReadOnly = false
				}
			}
		});
		this.studyIdentifier.subscribe(value => { 
			if(value != null){
				this.requestedStudy = value
			}
		});
	}

	ngOnInit() { 
		if (this.person == null){
			this.addNewPerson = true
		}
	}

	initialiseForm() {
		this.isFormBusy = false;

		if(this.person == null){
			let mtblsPerson = new MTBLSPerson();
			this.person = mtblsPerson
		}

		this.form = this.fb.group({
			lastName:  [ this.person.lastName, ValidateRules('lastName', this.fieldValidation('lastName'))],
			firstName:  [ this.person.firstName, ValidateRules('firstName', this.fieldValidation('firstName'))],
			midInitials:  [ this.person.midInitials, ValidateRules('midInitials', this.fieldValidation('midInitials'))],
			email:  [ this.person.email, ValidateRules('email', this.fieldValidation('email'))],
			phone:  [ this.person.phone, ValidateRules('phone', this.fieldValidation('phone'))],
			fax:  [ this.person.fax, ValidateRules('fax', this.fieldValidation('fax'))],
			address:  [ this.person.address, ValidateRules('address', this.fieldValidation('address'))],
			affiliation:  [ this.person.affiliation, ValidateRules('affiliation', this.fieldValidation('affiliation'))],
			comment:  [ ],
			roles: [ this.person.roles, ValidateRules('roles', this.fieldValidation('roles'))]
		});
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
		this.initialiseForm();
		this.isModalOpen = true
		if(this.rolesComponent){
			this.rolesComponent.setValues([])
		}
	}

	toogleShowAdvanced() {
		this.showAdvanced = !this.showAdvanced;
	}

	closeModal() {
		this.isModalOpen = false
	}

	confirmDelete(){
		this.isModalOpen = false
		this.isDeleteModalOpen = true
	}

	closeDelete(){
		this.isDeleteModalOpen = false
		this.isModalOpen = true
	}

	delete() {
		if(this.person.email != ''){
			this.editorService.deletePerson(this.person.email, null).subscribe( res => {
				this.updateContacts(res, 'Person deleted.')
				this.isDeleteModalOpen = false
				this.isModalOpen = false
			}, err => {
				this.isFormBusy = false
			});
		}else{
			this.editorService.deletePerson(null, this.person.firstName + this.person.lastName).subscribe( res => {
				this.updateContacts(res, 'Person deleted.')
				this.isDeleteModalOpen = false
				this.isModalOpen = false
			}, err => {
				this.isFormBusy = false
			});		
		}
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

	approveGrantSubmitterRole(){
		this.isModalOpen = false
		this.isApproveSubmitterModalOpen = true
	}

	closeSubmitterAproval(){
		this.isModalOpen = true
		this.isApproveSubmitterModalOpen = false
	}

	grantSubmitter(){
		this.editorService.makePersonSubmitter(this.person.email, this.requestedStudy).subscribe( res => {
			toastr.success("Added user as submitter", "Success", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			});	
			this.isModalOpen = true
			this.isApproveSubmitterModalOpen = false
		}, err => {
			this.isFormBusy = false
		});
	}

	save() {
		if(!this.isReadOnly){
			this.isFormBusy = true;
			if(!this.addNewPerson){
				if(this.getFieldValue('email') != this.person.email && this.person.email != ''){
					this.editorService.updatePerson(this.person.email, null, this.compileBody()).subscribe( res => {
						this.updateContacts(res, "Person updated")
					}, err => {
						this.isFormBusy = false
					});
				}else{
					this.editorService.updatePerson(null, this.person.firstName + this.person.lastName, this.compileBody()).subscribe( res => {
						this.updateContacts(res, "Person updated")
					}, err => {
						this.isFormBusy = false
					});	
				}
				
			}else{
				this.editorService.savePerson(this.compileBody()).subscribe( res => {
					this.updateContacts(res, "Person saved")
					this.closeModal();
				}, err => {
					this.isFormBusy = false
				});
			}
		}
	}

	updateContacts(res, message){
		if(!this.isReadOnly){
			this.editorService.getPeople().subscribe(data => {
				this.form.markAsPristine()
				this.initialiseForm();
				toastr.success(message, "Success", {
					"timeOut": "2500",
					"positionClass": "toast-top-center",
					"preventDuplicates": true,
					"extendedTimeOut": 0,
					"tapToDismiss": false
				});	
			});
		}
	}

	onChanges(){
		this.form.controls['roles'].setValue(this.rolesComponent.values);
		if(this.rolesComponent.values.length != 0){
			this.form.controls['roles'].markAsDirty();
		}
		this.form.markAsDirty();
	}

	getObject(data){
		return JSON.parse(data)
	}

	compileBody() {
		let jsonConvert: JsonConvert = new JsonConvert();
		let mtblPerson = new MTBLSPerson();
		mtblPerson.lastName = this.getFieldValue('lastName');
		mtblPerson.firstName = this.getFieldValue('firstName');
		mtblPerson.midInitials = this.getFieldValue('midInitials');
		mtblPerson.email = this.getFieldValue('email');
		mtblPerson.phone = this.getFieldValue('phone');
		mtblPerson.fax = this.getFieldValue('fax');
		mtblPerson.address = this.getFieldValue('address');
		mtblPerson.affiliation = this.getFieldValue('affiliation');
		this.rolesComponent.values.forEach( role => {
			mtblPerson.roles.push(jsonConvert.deserializeObject(role, Ontology))
		})
		return { "contacts" : [mtblPerson.toJSON()]}
	}

	getFieldValue(name){
		return this.form.get(name).value;
	}
}
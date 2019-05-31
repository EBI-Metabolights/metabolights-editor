import { Component, OnInit, Input, Inject, ViewChild, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { Ontology } from './../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../../store';
import * as toastr from 'toastr';
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { OntologyComponent } from './../../ontology/ontology.component';

@Component({
	selector: 'mtbls-design-descriptor',
	templateUrl: './design-descriptor.component.html',
	styleUrls: ['./design-descriptor.component.css']
})
export class DesignDescriptorComponent implements OnInit {

	@Input('value') descriptor: Ontology;
	@Input('readOnly') readOnly: boolean;

	@select(state => state.study.validations) studyValidations;
	validations: any = {}; 

	@ViewChild(OntologyComponent) descriptorComponent: OntologyComponent;

	validationsId = 'studyDesignDescriptors';

	isModalOpen: boolean = false;
	isDeleteModalOpen: boolean = false;

	form: FormGroup;
	isFormBusy: boolean = false;
	addNewDescriptor: boolean = false;

	constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) {
		this.studyValidations.subscribe(value => { 
			this.validations = value;
		});
	}

	ngOnInit() {
		if (this.descriptor == null){
			this.addNewDescriptor = true
		}
	}

	onChanges(e){
		if(this.descriptorComponent.values && this.descriptorComponent.values[0]){
			this.form.markAsDirty();	
		}
	}

	openModal() {
		if(!this.readOnly){			
			this.isModalOpen = true
			this.initialiseForm()
			if(this.addNewDescriptor){
				this.descriptor = null
				if(this.descriptorComponent){
					this.descriptorComponent.reset();
				}
			}
			let jsonConvert: JsonConvert = new JsonConvert();
			if(this.descriptorComponent){
				this.descriptorComponent.values[0] = jsonConvert.deserializeObject(this.descriptor, Ontology)
			}
		}
	}

	initialiseForm() {
		this.isFormBusy = false;
		this.form = this.fb.group({
		});
	}

	confirmDelete(){
		this.isModalOpen = false
		this.isDeleteModalOpen = true
	}

	closeDelete(){
		this.isDeleteModalOpen = false
		this.isModalOpen = true
	}

	closeModal() {
		this.isModalOpen = false
	}

	save() {
		if(this.descriptorComponent.values[0]){
			this.isFormBusy = true;
			if(!this.addNewDescriptor){
				this.editorService.updateDesignDescriptor(this.descriptor.annotationValue, this.compileBody()).subscribe( res => {
					this.updateDesignDescriptors(res, 'Design descriptor updated.')
				}, err => {
					this.isFormBusy = false
				});
			}else{
				this.editorService.saveDesignDescriptor(this.compileBody()).subscribe( res => {
					this.updateDesignDescriptors(res, 'Design descriptor saved.')
					this.descriptorComponent.values = []
					this.isModalOpen = false
				}, err => {
					this.isFormBusy = false
				});
			}
		}
	}

	updateDesignDescriptors(data, message){
		this.editorService.getDesignDescriptors().subscribe( res => {
			this.ngRedux.dispatch({ type: 'UPDATE_STUDY_DESIGN_DESCRIPTORS', body: {
				'studyDesignDescriptors': res.studyDesignDescriptors
			}})
		})

		this.form.markAsPristine()
		this.initialiseForm();
		this.isModalOpen = true;

		toastr.success( message, "Success", {
			"timeOut": "2500",
			"positionClass": "toast-top-center",
			"preventDuplicates": true,
			"extendedTimeOut": 0,
			"tapToDismiss": false
		});
	}

	delete() {
		this.editorService.deleteDesignDescriptor(this.descriptor.annotationValue).subscribe( res => {
			this.updateDesignDescriptors(res, 'Design descriptor deleted.')
			this.isDeleteModalOpen = false
			this.isModalOpen = false
		}, err => {
			this.isFormBusy = false
		});
	}

	compileBody() {
		let jsonConvert: JsonConvert = new JsonConvert();
		return { "studyDesignDescriptor" : jsonConvert.deserialize(this.descriptorComponent.values[0], Ontology)}
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

	get validation() {
		if(this.validationsId.includes(".")){
			var arr = this.validationsId.split(".");
			let tempValidations = JSON.parse(JSON.stringify(this.validations));;
			while (arr.length && (tempValidations = tempValidations[arr.shift()]));
			return tempValidations;
		}
		return this.validations[this.validationsId];
	}
}

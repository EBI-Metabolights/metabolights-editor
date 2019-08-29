import { Component, OnInit, Input, Inject, ViewChild, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { Ontology } from './../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../../store';
import * as toastr from 'toastr';
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import { OntologyComponent } from './../../ontology/ontology.component';
import { DOIService } from '../../../../services/publications/doi.service';
import { EuropePMCService } from '../../../../services/publications/europePMC.service';
import {FormControl} from '@angular/forms';
import { OntologySourceReference } from 'src/app/models/mtbl/mtbls/common/mtbls-ontology-reference';

@Component({
	selector: 'mtbls-design-descriptor',
	templateUrl: './design-descriptor.component.html',
	styleUrls: ['./design-descriptor.component.css']
})
export class DesignDescriptorComponent implements OnInit {

	@Input('value') descriptor: Ontology;
	@Input('readOnly') readOnly: boolean;

	@select(state => state.study.validations) studyValidations;
	@select(state => state.study.publications) studyPublications;
	validations: any = {}; 

	@ViewChild(OntologyComponent) descriptorComponent: OntologyComponent;

	@select(state => state.study.studyDesignDescriptors) studyDescriptors;

	validationsId = 'studyDesignDescriptors';
	selectedPublication  = new FormControl('', [Validators.required]);

	isModalOpen: boolean = false;
	isImportModalOpen: boolean = false;
	isDeleteModalOpen: boolean = false;
	publications: any = null;
	descriptors: any = null;

	form: FormGroup;
	isFormBusy: boolean = false;
	addNewDescriptor: boolean = false;
	keywords: any = [];
	selectedkeywords: any = [];
	status: string = "";

	loading: boolean = false;

	constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>, private doiService: DOIService, private europePMCService: EuropePMCService) {
		this.studyValidations.subscribe(value => { 
			this.validations = value;
		});
		this.studyPublications.subscribe(value => { 
            this.publications = value;
		});
		this.studyDescriptors.subscribe(value => { 
            this.descriptors = value;
        });
	}

	getKeyWords(){
		let doi = this.selectedPublication.value
		this.europePMCService.getArticleKeyWords('DOI:' + doi.replace('http://dx.doi.org/','')).subscribe( keywords => {
			let sd = this.descriptors.map(d => d.annotationValue)
			keywords.forEach(keyword => {
				if(sd.indexOf(keyword) == -1){
					this.keywords.push(keyword)
				}
			})
		}, error => {
			
		})
	}

	isSelected(keyword){
		if(this.selectedkeywords.indexOf(keyword) > -1){
			return true
		}
		return false
	}

	updateAndClose(){
		this.editorService.getDesignDescriptors().subscribe( res => {
			this.ngRedux.dispatch({ type: 'UPDATE_STUDY_DESIGN_DESCRIPTORS', body: {
				'studyDesignDescriptors': res.studyDesignDescriptors
			}})
		})
		this.closeImportModal()
	}

	toogleSelection(keyword){
		let index = this.selectedkeywords.indexOf(keyword)
		if(index > -1){
			this.selectedkeywords.splice(index, 1)
			this.delete(keyword)
		}else{
			this.loading = true;
			this.status = ""
			this.status = "Mapping keyword to an ontology term"
			this.editorService.getExactMatchOntologyTerm(keyword, "design%20descriptor").subscribe( terms => {
				if(terms.OntologyTerm.length > 0){
					let jsonConvert: JsonConvert = new JsonConvert();
					let descriptor =  { "studyDesignDescriptor" : jsonConvert.deserialize(terms.OntologyTerm[0], Ontology)}
					this.status = "Adding keyword to the study design descriptors list"
					this.editorService.saveDesignDescriptor(descriptor).subscribe( res => {
						this.status = ""
						this.selectedkeywords.push(keyword)
						this.loading = false;
					}, err => {
						this.loading = false
						this.status = ""
						this.isFormBusy = false
					});
				}else{
					this.status = "Exact ontology match not found. Create new MetaboLights Onotology term"
					let newOntology = new Ontology()
					newOntology.annotationValue = keyword;
					newOntology.termAccession = "http://www.ebi.ac.uk/metabolights/ontology/placeholder"
					newOntology.termSource = new OntologySourceReference();
					newOntology.termSource.description = "User defined terms"
					newOntology.termSource.file = "https://www.ebi.ac.uk/metabolights/"
					newOntology.termSource.name = "MTBLS"
					newOntology.termSource.provenance_name = "metabolights"
					newOntology.termSource.version = "1.0"
					let jsonConvert: JsonConvert = new JsonConvert();
					let descriptor =  { "studyDesignDescriptor" : jsonConvert.deserialize(newOntology, Ontology)}
					this.status = "Adding keyword to the study design descriptors list"
					this.editorService.saveDesignDescriptor(descriptor).subscribe( res => {
						this.selectedkeywords.push(keyword)
						this.loading = false
						this.status = ""
					}, err => {
						this.loading = false
						this.isFormBusy = false
						this.status = ""
					});
				}
			})
			
		}
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

	openImportModal(){
		this.closeModal()
		this.isImportModalOpen = true
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

	closeImportModal(){
		this.isImportModalOpen = false
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

	delete(value) {
		if(!value){
			value = this.descriptor.annotationValue 
		}
		this.editorService.deleteDesignDescriptor(value).subscribe( res => {
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

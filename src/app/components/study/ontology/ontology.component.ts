import { Component, OnInit, Input, Output, Inject, OnChanges, SimpleChanges, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidateRules } from './ontology.validator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocompleteTrigger } from '@angular/material';
import { Observable, fromEvent } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, startWith, switchAll, tap } from 'rxjs/operators';
import { EditorService } from '../../../services/editor.service';
import { MetaboLightsWSURL } from './../../../services/globals';

import { Ontology } from './../../../models/mtbl/mtbls/common/mtbls-ontology';
import { OntologySourceReference } from './../../../models/mtbl/mtbls/common//mtbls-ontology-reference';
import { JsonConvert, OperationMode, ValueCheckingMode} from "json2typescript"

 @Component({
 	selector: 'mtbls-ontology',
 	templateUrl: './ontology.component.html',
 	styleUrls: ['./ontology.component.css']
 })
 export class OntologyComponent implements OnInit{

 	@Input('validations') validations: any;
 	@Input('values') values: Ontology[] = [];
 	@Input('inline') isInline: boolean;
 	@Input('id') id: string;

 	@Output() changed = new EventEmitter<any>();

 	domain: string = '';
 	loading: boolean = false;
 	termsLoading: boolean = false;
 	isforcedOntology: boolean = false;
 	searchedMore: boolean = false;
 	url: string = '';
 	endPoints: any[] = [];
 	addOnBlur = false;
 	inputValue: string = '';
 	form: FormGroup;
 	isFormBusy: boolean = false;
 	visible = true;
 	selectable = true;
 	removable = true;
 	separatorKeysCodes: number[] = [ENTER, COMMA];
 	valueCtrl = new FormControl();
 	filteredvalues: Observable<Ontology[]>;
 	allvalues: Array<Ontology> = [];
 	ontologyDetails: any = {};

 	@ViewChild('input', {read: MatAutocompleteTrigger}) valueInput: MatAutocompleteTrigger;

 	constructor(private editorService: EditorService) {}

 	optionSelected(selected: MatAutocompleteSelectedEvent) {
 		if(selected.option.value != null || selected.option.value != undefined){
 			this.setValue(selected.option.value)	
 			var inputElement = <HTMLInputElement>document.getElementById('test')
 			inputElement.value = '';
 			this.triggerChanges()
 		}else{
 			this.retrieveMore()
 			setTimeout(() => {
	      		this.valueInput.openPanel();
	    	});
 		}
	}

 	showMore(e, accession){	
		this.editorService.getOntologyTermDescription('https://www.ebi.ac.uk/ols/api/ontologies/' + accession.termSource.name + '/terms/' + encodeURI(encodeURIComponent(accession.termAccession))).subscribe( response => {
			accession.info = response
		}, error => {
			accession.info = '-'
		})
 	}

 	getObjectKeys(ann){
 		return Object.keys(ann)
 	}

 	fetchOntologyDetails(){
 		this.allvalues.forEach(value => {
 			if(value.termSource.name != 'MTBLS'){
 				if(!this.ontologyDetails[value.termSource.name]){
	 				this.editorService.getOntologyDetails(value).subscribe( details => {
	 					this.ontologyDetails[value.termSource.name] = details
	 					if(details.config){
	 						value.termSource.version = details.config.version	
	 						value.termSource.description = details.config.title
	 						value.termSource.file = details.config.id
	 					}
	 				})
	 			}else{
	 				if(this.ontologyDetails[value.termSource.name].config){
	 					value.termSource.version = this.ontologyDetails[value.termSource.name].config.version
	 					value.termSource.description = this.ontologyDetails[value.termSource.name].config.title
	 					value.termSource.file = this.ontologyDetails[value.termSource.name].config.id	
	 				}
	 			}
 			}
 		})
 	}

   	ngOnInit() {
 		this.domain = MetaboLightsWSURL['domain']
 		if(this.values == null || this.values[0] == null){
 			this.values = []
 		}

 		if(this.validations['data-type'] == 'ontology'){
 			if(this.validations['recommended-ontologies']){
 				this.isforcedOntology = this.validations['recommended-ontologies']['is-forced-ontology']
 				this.url = this.validations['recommended-ontologies']['ontology']['url']
				 this.addOnBlur = this.validations['recommended-ontologies']['ontology']['allowFreeText']
 				this.endPoints = this.validations['recommended-ontologies']['ontology']
 				if(this.url != ''){
 					this.editorService.getOntologyTerms(this.domain + this.url).subscribe( terms => {
 						this.allvalues = [];
 						let jsonConvert: JsonConvert = new JsonConvert();
 						if(terms.OntologyTerm){
 							terms.OntologyTerm.forEach( term => {
	 							this.allvalues.push(jsonConvert.deserializeObject(term, Ontology))
	 						})
 						}
 						this.fetchOntologyDetails()
 						this.filteredvalues = this.valueCtrl.valueChanges.pipe(
 							startWith(null),
 							map((value: Ontology | null) => value ? this._filter(value) : this.allvalues.slice()));
      				})
 				}
 			}
 		}

 		this.valueCtrl.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(
 			(value) => {
 				if(value && value != ''){
 					this.inputValue = value
	 				this.allvalues = [];
	 				if(this.values.length < 1){
		 				let term = value
		 				this.termsLoading = false;
		 				this.searchedMore = false;
		 				this.loading = true;
		 				this.editorService.getOntologyTerms(this.domain + this.url + term).subscribe( terms => {
							this.allvalues = [];
							this.loading = false;
							let jsonConvert: JsonConvert = new JsonConvert();
							if(terms.OntologyTerm){
								terms.OntologyTerm.forEach( term => {
									this.allvalues.push(jsonConvert.deserializeObject(term, Ontology))
								})
							}
							this.fetchOntologyDetails()
							this.filteredvalues = this.valueCtrl.valueChanges.pipe(
								startWith(null),
								map((value: Ontology | null) => value ? this._filter(value) : this.allvalues.slice()));
						})
					}
 				}
 			},
 			err => console.error(err),
 		)
	}

 	retrieveMore(){
 		this.termsLoading = true;
 		this.allvalues = [];
		let term = this.inputValue
		this.loading = true;
		this.editorService.getOntologyTerms(this.domain + this.url + term + '&queryFields=MTBLS,MTBLS_Zooma,Zooma,OLS,Bioportal}').subscribe( terms => {
			this.allvalues = [];
			this.loading = false;
			let jsonConvert: JsonConvert = new JsonConvert();
			terms.OntologyTerm.forEach( term => {
				this.allvalues.push(jsonConvert.deserializeObject(term, Ontology))
			})
			this.fetchOntologyDetails()
			this.termsLoading = false;
			this.searchedMore = true;
			this.filteredvalues = this.valueCtrl.valueChanges.pipe(
				startWith(null),
				map((value: Ontology | null) => value ? this._filter(value) : this.allvalues.slice()));
		})
 	}

	indexOfObject(array, key, value): any {
		if(this.values && this.values.length > 0){
			return array.filter(el => el != null).map(e => e[key]).indexOf(value);	
		}
		return -1;
	}

	remove(value: Ontology): void {
		const index = this.indexOfObject(this.values, 'annotationValue', value.annotationValue);
		if (index >= 0) {
			this.values.splice(index, 1);
		}
		this.triggerChanges();
	}

	add(event: MatChipInputEvent): void {
		if(this.addOnBlur){
			const input = event.input;
			const value = event.value;
			if(event.value.replace(" ", '') != ''){
				if(this.indexOfObject(this.values, 'annotationValue', value ) == -1){
					let newOntology = new Ontology()
					newOntology.annotationValue = value;
					newOntology.termAccession = "http://www.ebi.ac.uk/metabolights/ontology/placeholder"
					newOntology.termSource = new OntologySourceReference();
					newOntology.termSource.description = "User defined terms"
					newOntology.termSource.file = "https://www.ebi.ac.uk/metabolights/"
					newOntology.termSource.name = "MTBLS"
					newOntology.termSource.provenance_name = "metabolights"
					newOntology.termSource.version = "1.0"
					this.setValue(newOntology)
				}
				var inputElement = <HTMLInputElement>document.getElementById('test')
 				inputElement.value = '';
				this.valueCtrl.setValue(null);
				this.triggerChanges();
			}
		}
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		if(this.indexOfObject(this.values, 'annotationValue', event.option.value.annotationValue ) == -1){
			this.setValue(event.option.value);
		}
		this.valueCtrl.setValue(null);
		this.triggerChanges();
	}

	setValue(value){
		let termExists = false
		this.allvalues.forEach( val => {
			if (typeof value == 'string' || value instanceof String) {
				if(value && (val.annotationValue.toLowerCase() == value.toLowerCase())){
					termExists = true
					this.values = [val]
				}
			} else {
				if(val.annotationValue &&  value.annotationValue && (val.annotationValue.toLowerCase() == value.annotationValue.toLowerCase())){
					termExists = true
					this.values = [val]
				}
			}
		})
		if(!termExists){
			this.values = [value]
		}
	}

	reset(){
		this.inputValue = ""
		this.allvalues = []
		this.valueCtrl.setValue(null)
		this.values = []
		this.retrieveMore()
	}

	triggerChanges(){
		this.changed.emit(this.values);
	}

	private _filter(value: Ontology): Ontology[] {
		if(value.annotationValue){
			const filterValue = value.annotationValue.toLowerCase();
			return this.allvalues.filter(value => value.annotationValue.toLowerCase().indexOf(filterValue) === 0);	
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		this.values = this.values.filter(val => val != null)
    }
}
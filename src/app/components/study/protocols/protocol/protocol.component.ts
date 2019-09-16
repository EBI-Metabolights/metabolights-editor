import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { MTBLSProtocol, ProtocolParameter } from './../../../../models/mtbl/mtbls/mtbls-protocol';
import { Ontology } from './../../../../models/mtbl/mtbls/common/mtbls-ontology';

import { IAppState } from '../../../../store';
import { NgRedux, select } from '@angular-redux/store';
import { ValidateRules } from './protocol.validator';
import { OntologyComponent } from './../../ontology/ontology.component';
import * as toastr from 'toastr';
import { JsonConvert } from "json2typescript";

@Component({
	selector: 'mtbls-protocol',
	templateUrl: './protocol.component.html',
	styleUrls: ['./protocol.component.css']
})
export class ProtocolComponent implements OnInit {

	@Input('value') protocol: any;
	@Input('required') required: boolean = false;
	@Input('validations') validations: any;

	@ViewChild(OntologyComponent) parameterName: OntologyComponent;

	isModalOpen: boolean = false;
	isBulkEditModalOpen: boolean = false;
	isDeleteModalOpen: boolean = false;
	isParameterModalOpen: boolean = false;
	isFormBusy: boolean = false;
	isSymbolDropdownActive: boolean = false;

	editor: any;

	selectedProtocol: any = null;

	addNewProtocol: boolean = false;
	caretPos: number = 0;

	form: FormGroup;

	validationsId = 'protocols.protocol';

	constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) { 
    }

    saveColumnValue(col, assay){
    	let columns = []
    	let column = {
	      "name": "",
	      "value": "",
	      "index": null
	    }
	    if(col.isOntology){
	    	column.value = col.values[0][0].annotationValue
	    	column.index = col.index
	    	column.name = col.name
			columns.push(column)
	    	let ontSrc = {
		      "name": col.ontologyDetails.ref,
		      "value": col.values[0][0].termSource.name,
		      "index": col.index + 1
		    }
		    columns.push(ontSrc)
		    let ontAcc = {
		      "name": col.ontologyDetails.accession,
		      "value": col.values[0][0].termAccession,
		      "index":  col.index + 2
		    }
		    columns.push(ontAcc)
	    }else{
	    	column.value = col.values[0]
	    	column.index = col.index
	    	column.name = col.name
	    	columns.push(column)
	    }
    	this.editorService.addColumns(assay, { "data" : columns }, 'assays', null).subscribe(res => {
	            toastr.success( "Assay specifications updated.", "Success", {
	                "timeOut": "2500",
	                "positionClass": "toast-top-center",
	                "preventDuplicates": true,
	                "extendedTimeOut": 0,
	                "tapToDismiss": false
	            });
            }, err => {
                console.log(err)
            }
        );
    }

    formatTitle(term){
		let s = term.replace(/_/g, " ").replace(/\.[^/.]+$/, "").replace(/\[/g, " - ").replace(/\]/g, "");
		return s[0].toUpperCase() + s.slice(1)
	}

    hasAllSectionsEmpty(){
    	let isEmpty = true;
    	this.getAssaysWithProtocol().forEach(assay => {
    		this.protocol.meta[assay].forEach(col => {
    			if(!col['is-hidden']){
    				isEmpty = false	
    			}
    		})
    	})
    	return isEmpty;
    }

    hasAssaySectionsEmpty(assay){
    	let isEmpty = true;
		this.protocol.meta[assay].forEach(col => {
			if(!col['is-hidden']){
				isEmpty = false	
			}
		})
		return isEmpty;
	}
	
	setEditor(editor: any) {
		this.editor = editor
		this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
			let ops = []
			delta.ops.forEach(op => {
				if (op.insert && typeof op.insert === 'string') {
					ops.push({
						insert: op.insert
					})
				}
			})
			delta.ops = ops
			return delta
		})
	}

    toggleBulkEditSection(){
    	this.isBulkEditModalOpen = !this.isBulkEditModalOpen
    }

    toggleSymbolDropdown(){
    	this.isSymbolDropdownActive = !this.isSymbolDropdownActive
    }

    addSymbol(content){
		this.editor.focus()
    	var caretPosition = this.editor.getSelection(true);
		this.editor.insertText(caretPosition, content, 'user');
		this.toggleSymbolDropdown()
    }

    getAssaysWithProtocol(){
    	return Object.keys(this.protocol.meta)
    }

    copyToClipboard(item) {
	    document.addEventListener('copy', (e: ClipboardEvent) => {
	      e.clipboardData.setData('text/plain', (item));
	      e.preventDefault();
	      document.removeEventListener('copy', null);
	    });
	    document.execCommand('copy');
	    toastr.success( "", "Copied symbol " + item + " to clipboard", {
	      "timeOut": "0",
	      "positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0
	    })
	}

	ngOnInit() {
		if (this.protocol == null){
			this.addNewProtocol = true
		}
	}

	clearFormatting(target){
		this.setFieldValue(target, this.strip(this.getFieldValue(target)))
	}

	strip(html)
	{
   		var tmp = document.createElement("DIV");
   		tmp.innerHTML = html;
   		return tmp.textContent || tmp.innerText || "";
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
		this.form.removeControl('description');
	}

	openParameterModal() {
		this.parameterName.values = []
		this.isParameterModalOpen = true
	}

	closeParameterModal() {
		this.isParameterModalOpen = false
	}


	deleteParameter(parameter){
		let filteredParameters = this.form.get('parameters').value.filter(function( obj ) {
		    return obj.parameterName.annotationValue !== parameter.parameterName.annotationValue;
		});
		if(filteredParameters){
			this.form.get('parameters').setValue(filteredParameters);
			this.form.markAsDirty();
		}
	}

	addParameter(){
		let parameter = new ProtocolParameter();
		parameter.parameterName = this.parameterName.values[0];
		if(this.form.get('parameters').value.length == 1 && this.form.get('parameters').value[0].parameterName.annotationValue == ''){
			this.form.get('parameters').setValue([parameter]);
		}else if(this.form.get('parameters').value.length == 1 && this.form.get('parameters').value[0].parameterName.annotationValue != ''){
			this.form.get('parameters').setValue(this.form.get('parameters').value.concat(parameter));
		}else if(this.form.get('parameters').value.length > 1){
			this.form.get('parameters').setValue(this.form.get('parameters').value.concat(parameter));
		}else{
			this.form.get('parameters').setValue([parameter]);
		}
		this.isParameterModalOpen = false;
		this.form.markAsDirty();
	}
	
	save() {
		if(this.getFieldValue('description')){
			this.isFormBusy = true;
			if(!this.addNewProtocol){
				this.editorService.updateProtocol(this.protocol.name, this.compileBody()).subscribe( res => {
					this.updateProtocols(res, 'Protocol updated.')
					this.form.removeControl('description')
					// this.isModalOpen = false;
				}, err => {
					this.isFormBusy = false
				});
			}else{
				this.editorService.saveProtocol(this.compileBody()).subscribe( res => {
					this.updateProtocols(res, 'Protocol saved.')
					this.form.removeControl('description')
					this.isModalOpen = false
				}, err => {
					this.isFormBusy = false
				});
			}
		}else{
			alert("Protocol description cannot be empty")
		}
	}

	delete() {
		if(!this.required){
			this.editorService.deleteProtocol(this.protocol.name).subscribe( res => {
					this.addNewProtocol = true
					this.updateProtocols(res, 'Protocol deleted.')
					this.form.removeControl('description')
					this.isDeleteModalOpen = false
					this.isModalOpen = false
				}, err => {
					this.isFormBusy = false
			});
		}else{
			toastr.error( "Cannot delete a default protocol", "Error", {
				"timeOut": "2500",
				"positionClass": "toast-top-center",
				"preventDuplicates": true,
				"extendedTimeOut": 0,
				"tapToDismiss": false
			});
		}
	}

	initialiseForm() {
		this.isFormBusy = false;
		this.form = null;
		if(this.protocol == null){
			  let mtblsProtocol = new MTBLSProtocol();
			  mtblsProtocol.parameters = [];
			  this.protocol = mtblsProtocol
		}
		this.form = this.fb.group({
			name:  [ { value: this.protocol.name, disabled: this.required }, ValidateRules('name', this.fieldValidation('name'))],
			parameters:  [ this.protocol.parameters ],
			description:  [ this.protocol.description, ValidateRules('description', this.fieldValidation('description'))]
		});
	}

	openModal(protocol) {
		this.initialiseForm()
		if(this.protocol.parameters.length > 0){
			this.form.get('parameters').setValue(this.protocol.parameters);
		}else{
			this.form.get('parameters').setValue([]);
		}
		this.selectedProtocol = protocol;
		this.isModalOpen = true
	}

	updateProtocols(data, message){
		this.editorService.getProtocols(null).subscribe( res => {
			this.form.reset()
			this.form.markAsPristine()
			this.initialiseForm();
			if(!this.addNewProtocol){
				let jsonConvert: JsonConvert = new JsonConvert();
				this.protocol = jsonConvert.deserialize(res.protocols.filter( p => {
					return p.name == this.protocol.name
				})[0], MTBLSProtocol);
				this.openModal(this.protocol)
			}
			   
			
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
		let mtblProtocol = new MTBLSProtocol();
		mtblProtocol.name = this.getFieldValue('name');
		mtblProtocol.description = this.getFieldValue('description').replace(/#/g, " ").replace(/"/g, "'");
		mtblProtocol.protocolType = new Ontology()
		mtblProtocol.protocolType.annotationValue = this.getFieldValue('name');
		mtblProtocol.parameters = this.getFieldValue('parameters')
		return { "protocol" : mtblProtocol.toJSON()}
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

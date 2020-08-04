import { Component, ViewChild, OnInit, Input, Inject, ViewChildren, AfterContentInit, QueryList, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../../store';
import { MTBLSPerson } from '../../../../models/mtbl/mtbls/mtbls-person';
import { Ontology } from '../../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from '../../../../models/mtbl/mtbls/mtbls-publication';
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DOIService } from '../../../../services/publications/doi.service';
import { EuropePMCService } from '../../../../services/publications/europePMC.service';
import * as toastr from 'toastr';
import Swal from 'sweetalert2';
import { tassign } from 'tassign'; 

@Component({
	selector: 'add-assay',
	templateUrl: './add-assay.component.html',
	styleUrls: ['./add-assay.component.css']
})
export class AddAssayComponent implements OnInit {
	@select(state => state.study.identifier) studyIdentifier; 
	@select(state => state.study.validations) studyValidations; 

	requestedStudy: string = null;
	validations: any = null;

	isAddAssayModalOpen: boolean = false;
	selectedAssayTechnologyOption: any = null;
	selectedAssayTypeOption: any = null;
	selectedAssayTypes: any[] = [];
	currentSelectedAssayType: any = null;
	selectedAssayVariantOption: any = null;
	selectedAssayVariantColumnOption: any = [];

	assaySetup : any = null;

	constructor(private fb: FormBuilder, private editorService: EditorService, private route: ActivatedRoute, private router: Router) {
		this.studyIdentifier.subscribe(value => { 
			if(value != null){
				this.requestedStudy = value
			}
		});
		this.studyValidations.subscribe(value => { 
			if(value){
				this.validations = value;
	      		this.assaySetup = value['assays']['assaySetup']
			}	      
	    });
	}

	ngOnInit() {
	}

	openAddAssayModal(){
		this.isAddAssayModalOpen = true;
	}

	closeAddAssayModal(){
		this.isAddAssayModalOpen = false;	
	}

	assayTechnologyChange(){
		this.selectedAssayTypeOption = null;
		this.selectedAssayVariantOption = null;
		this.selectedAssayVariantColumnOption = [];
	}

	assayTypeChange(){
		this.selectedAssayVariantOption = null;
	}

	currentSelectedAssayTypeChange(){
		this.selectedAssayVariantOption = null;
		this.selectedAssayVariantColumnOption = [];
	}

	assayTypeVariantChange(){
		if(this.selectedAssayVariantOption.columns && this.selectedAssayVariantOption.columns.length > 0){
			this.selectedAssayVariantColumnOption = []
		}
	}

	assayTypeVariantColumnChange(){
	}

	extractAssayDetails(assay){
		if((assay.name.split(this.requestedStudy)[1])){
			let assayInfo = (assay.name.split(this.requestedStudy)[1]).split("_");
			let assaySubTechnique = null
			let assayTechnique = null
			let assayMainTechnique = null
			this.assaySetup.main_techniques.forEach(mt => {
				mt.techniques.forEach(t => {
					if( t.sub_techniques && t.sub_techniques.length > 0){
						t.sub_techniques.forEach(st => {
							if(st.template == assayInfo[1]){
								assaySubTechnique = st
								assayTechnique = t
								assayMainTechnique = mt
							}
						})
					}
				})
			})
			return {
				"assaySubTechnique" : assaySubTechnique,
				"assayTechnique" : assayTechnique,
				"assayMainTechnique" : assayMainTechnique
			};
		}
		return {
			"assaySubTechnique" : '',
			"assayTechnique" : '',
			"assayMainTechnique" : ''
		}
	}

	addAssay(){
		let body = { 
			"assay": {        
				"type": this.selectedAssayVariantOption.template,
				"columns": []
			}
		}
		let tempColumns = []
		if(this.selectedAssayVariantColumnOption.length > 0){
			this.selectedAssayVariantColumnOption.forEach( col => {
				tempColumns.push({
					"name"  : col.header,
					"value" : col.value
				})
			})
		}
		body['assay']['columns'] = tempColumns

		this.editorService.addAssay(body).subscribe(res => {
			this.selectedAssayTypeOption = null;
			this.selectedAssayVariantOption = null;
			this.selectedAssayVariantColumnOption = []
			this.isAddAssayModalOpen = false;
			this.editorService.loadStudyFiles();
			this.editorService.loadStudyProtocols();
			Swal.fire({
				title: 'Assay added!',
				text: '',
				type: 'success'
			});
		})
	}

}

import { Component, ViewChild, OnInit, Input, Inject, ViewChildren, AfterContentInit, QueryList, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../store';
import { MTBLSPerson } from './../../../models/mtbl/mtbls/mtbls-person';
import { Ontology } from './../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from './../../../models/mtbl/mtbls/mtbls-publication';
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"
import { MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import { DOIService } from '../../../services/publications/doi.service';
import { TableComponent } from './../../shared/table/table.component';
import { EuropePMCService } from '../../../services/publications/europePMC.service';
import * as toastr from 'toastr';
import Swal from 'sweetalert2';
import { tassign } from 'tassign'; 

@Component({
	selector: 'guide-assays',
	templateUrl: './assays.component.html',
	styleUrls: ['./assays.component.css']
})
export class GuidedAssaysComponent implements OnInit {

	@select(state => state.study.identifier) studyIdentifier; 
	@select(state => state.study.files) studyFiles; 
	@select(state => state.study.assays) studyAssays; 
	@select(state => state.study.samples) studySamples; 

	requestedStudy: string = null;
	loading: boolean = false;
	assays: any = [];

	selectedMAFDataArray: any[] = [];
	selectedAssay: any = null;
	selectedAssayData: any = null;
	samplesNames: any = "";
	controlsNames: any = "";

	isEditAssayModalOpen: boolean = false;
	subStep: number = 1;
	files: any = [];
	samples: any = {};

	constructor(private fb: FormBuilder, private editorService: EditorService, private route: ActivatedRoute, private router: Router) {
		this.editorService.initialiseStudy(this.route)
		this.studyIdentifier.subscribe(value => { 
			if(value != null){
				this.requestedStudy = value
			}
		});
		this.studyFiles.subscribe(value => { 
			if(value != null){
				this.files = value
			}else{
				this.editorService.loadStudyFiles()
			}
		});
		this.studyAssays.subscribe(value => { 
			this.assays = Object.values(value)
			if(this.assays.length > 0){
				this.assays.sort(function(a, b){
				    if(a.name < b.name) { return -1; }
				    if(a.name > b.name) { return 1; }
				    return 0;
				})	
			}
		});
		this.studySamples.subscribe(value => { 
			this.samples = value
		});
	}

	ngOnInit() {
	}
	
	deleteSelectedAssay(name){
		Swal.fire({
		  	title: "Are you sure?",
		  	text: "Once deleted, you will not be able to recover this assay!",
		  	showCancelButton: true,
      		confirmButtonColor: "#DD6B55",
      		confirmButtonText: "Confirm",
      		cancelButtonText: "Back"
		})
		.then((willDelete) => {
		  if (willDelete.value) {
		 	 this.editorService.deleteAssay(name).subscribe( resp => {
				this.extractAssayInfo(true)
				Swal.fire({
					title: 'Assay deleted!',
					text: '',
					type: 'success',
					confirmButtonText: 'OK'
				}).then(() => {
				});
			})
		  }
		});
	}

	saveSamples(){
		let exisitingSamples = []
		if(this.controlsNames && this.samplesNames){
			let finalControls = this.controlsNames.replace(/,/g, "\n").split("\n")
			let finalSamples = this.samplesNames.replace(/,/g, "\n").split("\n")
			if(finalSamples.length <= 0){
				toastr.error( "Please add sample names", "Error", {
					"timeOut": "2500",
					"positionClass": "toast-top-center",
					"preventDuplicates": true,
					"extendedTimeOut": 0,
					"tapToDismiss": false
				});
			}else{
				let sRows = []
				let duplicatedExist = false
				let duplicates = []
				finalControls.forEach( s => {
					if(exisitingSamples.indexOf(s) < 0){
						let emptyRow = this.getEmptyRow(this.samples.data)
						emptyRow['Source Name'] = s
						emptyRow['Sample Name'] = s
						emptyRow['Protocol REF'] = "Sample collection"
						sRows.push(emptyRow);
					}else{
						duplicates.push(s)
					}
				})
				finalSamples.forEach( s => {
					if(exisitingSamples.indexOf(s) < 0){
						let emptyRow = this.getEmptyRow(this.samples.data)
						emptyRow['Source Name'] = s
						emptyRow['Sample Name'] = s
						emptyRow['Protocol REF'] = "Sample collection"
						sRows.push(emptyRow);
					}else{
						duplicates.push(s)
					}
				})
				if(duplicates.length > 0 && sRows.length > 0){
					Swal.fire({
						title: 'Duplicate samples found',
						text: duplicates.join(", ") + ' already exist',
						type: 'warning',
						showCancelButton: true,
					  confirmButtonColor: '#3085d6',
					  cancelButtonColor: '#d33',
					  confirmButtonText: 'Ignore duplicates, proceed!'
					}).then((result) => {
					  if (result.value) {
					    this.editorService.addRows(this.samples.name, { "data": { "rows": sRows, "index": 0 }}, 'samples', null).subscribe( res => {
							toastr.success( "Samples added successfully", "Success", {
				                "timeOut": "2500",
				                "positionClass": "toast-top-center",
				                "preventDuplicates": true,
				                "extendedTimeOut": 0,
				                "tapToDismiss": false
				            });
				            this.controlsNames = ""
				            this.samplesNames = ""
							this.changeSubStep(4)
						}, err => {
							console.log(err)
						});
					  }
					})
				}else if(duplicates.length > 0 && sRows.length == 0){
					this.changeSubStep(4)
				}else{
					this.editorService.addRows(this.samples.name, { "data": { "rows": sRows, "index": 0 } },'samples', null).subscribe( res => {
						toastr.success( "Samples added successfully", "Success", {
			                "timeOut": "2500",
			                "positionClass": "toast-top-center",
			                "preventDuplicates": true,
			                "extendedTimeOut": 0,
			                "tapToDismiss": false
			            });
			            this.controlsNames = ""
				        this.samplesNames = ""
						this.changeSubStep(4)
					}, err => {
						console.log(err)
					});
				}
			}
		}else{
			toastr.error( "Please add experimental controls and sample names", "Error", {
                "timeOut": "2500",
                "positionClass": "toast-top-center",
                "preventDuplicates": true,
                "extendedTimeOut": 0,
                "tapToDismiss": false
            });
		}
	}

	getEmptyRow(data){
		let obj = tassign({}, data.rows[0]);
		Object.keys(obj).forEach(function (prop) {
			obj[prop] = "";
		});
		return obj;
	}

	changeSubStep(i){
		this.subStep = i
	}

	openEditAssayModal(assay, substep){
		this.subStep = 1
		this.selectedMAFDataArray = []
		this.selectedAssay = assay
		this.selectedAssayData = this.selectedAssay['data']
		this.isEditAssayModalOpen = true;
	}

	closeEditAssayModal(){
		this.isEditAssayModalOpen = false;
	}

	openFullStudyView(){
		Swal.fire({
		  	title: "Switch to full study view? Are you sure?",
		  	text: "Please add assay details by using the add/edit details button!",
		  	showCancelButton: true,
      		confirmButtonColor: "#DD6B55",
      		confirmButtonText: "Confirm",
      		cancelButtonText: "Back"
		})
		.then((willDelete) => {
		  if(willDelete.value){
		  	this.router.navigate(['/study', this.requestedStudy])
		  }
		});
	}

	extractAssayInfo(reloadFiles){
		if(reloadFiles){
			this.editorService.loadStudyFiles();
		}else{
			this.editorService.loadStudyAssays(this.files);
		}
	}
}

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

	requestedStudy: string = null;
	loading: boolean = false;
	assays: any = [];

	selectedMAFDataArray: any[] = [];
	selectedAssay: any = null;
	selectedAssayData: any = null;

	isEditAssayModalOpen: boolean = false;
	subStep: number = 1;
	files: any = [];

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

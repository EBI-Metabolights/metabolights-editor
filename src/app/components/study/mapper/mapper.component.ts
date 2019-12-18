import { Component, OnInit, Input, Inject, ViewChildren, AfterContentInit, QueryList, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'study-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.css']
})
export class MapperComponent implements OnInit {

  isAddFileMapperModalOpen: boolean = false;
  

  @select(state => state.study.identifier) studyIdentifier; 
	@select(state => state.study.files) studyFiles; 
	@select(state => state.study.assays) studyAssays; 
  @select(state => state.study.samples) studySamples; 

  selected: any = {}
  
  fileNames: any = [];
  fileFilter: any = '';
  sampleNames: any = [];
  samplesFilter: any = '';
  assaysNames: any = [];

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
        let index = 0
        this.files.study.forEach(file => {
          this.fileNames.push({
            sort_order: index,
            name: file
          })
          index = index+ 1
        })
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
      let index = 0
      this.assays.forEach( assay => {
        let exists = false;
        this.assaysNames.forEach(a => {
          if((a.name) == assay.name){
            exists = true
          }
        })
        if(!exists){
          this.assaysNames.push({
            sort_order: index,
            name: assay.name
          })
        }
      })
		});
		this.studySamples.subscribe(value => { 
      this.samples = value
      let index = 0
      this.samples.data.rows.forEach(row => {
        this.sampleNames.push({
          sort_order: index,
          name: row['Sample Name']
        })
        index = index+ 1
      })
		});
	}

	ngOnInit() {

  }
  

  select(arr, item, index){
    if(this.selected[arr]){
      this.selected[arr][index] = item
    }else{
      this.selected[arr] = []
      this.selected[arr][index] = item
    }
  }

  isSelected(arr, index, item){
    if(this.selected[arr]){
      return this.selected[arr][index] && this.selected[arr][index] === item
    }
    return false;
  }
  
  drop(event: CdkDragDrop<string[]>) {
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //                     event.container.data,
    //                     event.previousIndex,
    //                     event.currentIndex);
    // }
  }

  get fileNamesArray() {
    return ((this.fileNames.sort((a, b) => a.sort_order > b.sort_order)).map( a => a.name )).filter(data => {
      return data.file.toLowerCase().indexOf(this.fileFilter.toLowerCase()) > -1
    })
  }

  get selectedRawItemsCount() {
    return this.selected['rawFiles'].filter( item => item != null).length;
  }

  get sampleNamesArray() {
    return this.sampleNames.sort((a, b) => a.sort_order > b.sort_order ).map( a => a.name );
  }

  get assayNamesArray() {
    return ((this.assaysNames.sort((a, b) => a.sort_order > b.sort_order)).map( a => a.name )).filter(data => {
      return data.toLowerCase().indexOf(this.fileFilter.toLowerCase()) > -1
    })
  }
  
  openFilesMapperModal(){
    this.isAddFileMapperModalOpen = true; 
  }

}

import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { select } from '@angular-redux/store';
import Swal from 'sweetalert2';
import { EditorService } from '../../../../services/editor.service';
import { TableComponent } from './../../../shared/table/table.component';

@Component({
  selector: 'assay-details',
  templateUrl: './assay-details.component.html',
  styleUrls: ['./assay-details.component.css']
})
export class AssayDetailsComponent implements OnInit {

	@Input('assayName') assayName: any;
	@select(state => state.study.assays) assays;
  @select(state => state.study.samples) studySamples;
  @ViewChild(TableComponent) assayTable: TableComponent;

  @select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

  fileTypes: any = [
		{
			filter_name : "MetaboLights assay sheet type",
			extensions : ["txt"]
		}
  ];

	assay: any = null;
  addSamplesModalOpen = false;
  filteredSampleNames: any = []

  sampleNames: any = []
  existingSampleNamesInAssay: any = []
  duplicateSampleNamesInAssay: any = []

  @Output() assayDelete = new EventEmitter<any>();
  
  constructor(private editorService: EditorService) {
    this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
  }

  ngOnInit() {
    this.assays.subscribe(value => { 
      this.assay = value[this.assayName];
    });
    this.studySamples.subscribe(value => { 
      this.sampleNames = value.data.rows.map( r => r['Sample Name'])
      this.filteredSampleNames = this.sampleNames
    });
  }

  onSamplesFilterKeydown(event, filterValue:string){
    if (event.key === "Enter") {
      this.filteredSampleNames(filterValue)
    }
  }

  applySamplesFilter(filterValue: string) {
    this.filterSampleNames(filterValue)
  }

  filterSampleNames(filterValue){
    this.duplicateSampleNamesInAssay = []
    if(filterValue == ''){
      this.filteredSampleNames = this.sampleNames
    }else{
      this.filteredSampleNames = this.sampleNames.filter( s => {
        return (s).toString().indexOf(filterValue) !== -1
      })
    }

    this.existingSampleNamesInAssay.forEach( n => {
      if(this.filteredSampleNames.indexOf(n) > -1){
        this.duplicateSampleNamesInAssay.push(n)
      }
    })
  }


  addSamples(){
    let emptyRow = this.assayTable.getEmptyRow()
    let dataToWrite = []
    this.filteredSampleNames.forEach( n => {
      let tempRow = JSON.parse(JSON.stringify(emptyRow))
      tempRow['Sample Name'] = n
      dataToWrite.push(tempRow)
    })
    this.assayTable.addRows(dataToWrite, 0)
  }

  validateAssaySheet(){
    this.editorService.validateMAF(this.assayName).subscribe(data => {
      console.log("MAF updated")
    })
  }

  openAddSamplesModal(){
    this.addSamplesModalOpen = true
  }

  closeAddSamplesModal(){
    this.addSamplesModalOpen = false
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
          this.assayDelete.emit(name)
          this.editorService.loadStudyFiles();
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
}

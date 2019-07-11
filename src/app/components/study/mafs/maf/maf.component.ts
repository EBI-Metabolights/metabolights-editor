import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { TableComponent } from './../../../shared/table/table.component';
import { select } from '@angular-redux/store';

@Component({
  selector: 'mtbls-maf',
  templateUrl: './maf.component.html',
  styleUrls: ['./maf.component.css']
})
export class MafComponent {

	@Input('value') value: any;

	@select(state => state.study.mafs) studyMAFs;

	mafData : any = null;
	currentRow = 0;
	isAutoPopulateModalOpen = false;
	isRowEditModalOpen = false;
	isFormBusy: boolean	= false;
	selectedRow = {};
	form: FormGroup;

	fileTypes: any = [
		{
			filter_name : "MetaboLights maf sheet type",
			extensions : ["tsv"]
		}
  ];

	@ViewChild(TableComponent) mafTable: TableComponent;

  	constructor(private fb: FormBuilder, private editorService: EditorService) {}

	ngAfterContentInit(){
		this.studyMAFs.subscribe(mafs => {
			if(mafs){
				this.mafData = mafs[this.value.data.file]
			}
		});
	}
	
	openRowEditModal(row){
		this.isRowEditModalOpen = true;
		this.selectedRow = row;
		this.form = this.fb.group({
			name:  [ row['metabolite_identification'] ],
			smiles:  [ row['smiles'] ],
			inchi:  [ row['inchi'] ],
			databaseId:  [ row['database_identifier'] ]
		});
	}

	getChebiId(){
		let dbId = this.form.get('databaseId').value
		if(dbId && dbId != ''){
			if(dbId.toLowerCase().indexOf("chebi") > -1){
				return dbId.split(":")[1]
			}
		}
	}

	nextRow(){
		if(this.currentRow < this.mafTable.data.rows.length){
			this.currentRow = this.currentRow + 1
			this.loadAutoPopulateField(this.currentRow)
		}
	}

	previousRow(){
		if(this.currentRow > 0){
			this.currentRow = this.currentRow - 1
			this.loadAutoPopulateField(this.currentRow)
		}
	}

	loadAutoPopulateField(i){
		let row = this.mafTable.data.rows[i]
		this.selectedRow = row;
		this.form = this.fb.group({
			name:  [ row['metabolite_identification'] ],
			smiles:  [ row['smiles'] ],
			inchi:  [ row['inchi'] ],
			databaseId:  [ row['database_identifier'] ]
		});
	}

	autoPopulate(){
		this.openAutoPopulateModal();
		this.loadAutoPopulateField(this.currentRow)
	}

	openAutoPopulateModal(){
		this.isAutoPopulateModalOpen = true;
	}

	closeAutoPopulateModal(){
		this.isAutoPopulateModalOpen = false;
	}

	search(type){
		let term = this.form.get(type).value;
		this.isFormBusy = true;
		this.editorService.search(term, type).subscribe( res => {
			let resultObj = res.content[0]
			this.isFormBusy = false;
			let fields = ['name', 'smiles', 'inchi', 'databaseId']
			fields.forEach(field =>{
				if(field != term){
					this.form.get(field).setValue(resultObj[field], {emitEvent: false})
				}
			})
			this.form.markAsDirty();
		}, err => {
			this.isFormBusy = false;
			this.form.markAsDirty();
		})
	}

	saveCell(){
		this.selectedRow['metabolite_identification'] = this.form.get('name').value
		this.selectedRow['inchi'] = this.form.get('inchi').value
		this.selectedRow['database_identifier'] = this.form.get('databaseId').value
		this.selectedRow['smiles'] = this.form.get('smiles').value
		this.mafTable.updateRows([this.selectedRow]);
	}

	closeRowEditModal(){
		this.isRowEditModalOpen = false;
	}
	
}

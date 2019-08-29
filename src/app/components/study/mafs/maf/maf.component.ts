import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EditorService } from '../../../../services/editor.service';
import { TableComponent } from './../../../shared/table/table.component';
import { select } from '@angular-redux/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'mtbls-maf',
  templateUrl: './maf.component.html',
  styleUrls: ['./maf.component.css']
})
export class MafComponent {

	@Input('value') value: any;

	@select(state => state.study.mafs) studyMAFs;

	currentID = null;

	mafData : any = null;
	currentRow = 0;
	isAutoPopulateModalOpen = false;
	isRowEditModalOpen = false;
	isFormBusy: boolean	= false;
	selectedRow = {};
	form: FormGroup;
	currentIndex = 0;

	rowsToUpdate = []
	inProgress = true

	isAutoPopulating: boolean = false;

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
				this.currentID = dbId.split(":")[1]
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

	 autoPopulate(manual){
		if(manual){
			this.openAutoPopulateModal();
			this.loadAutoPopulateField(this.currentRow)
			this.getChebiId()
		}else{
			
			let promises = []
			this.isAutoPopulating = true
			this.mafData.data.rows.forEach(row => {
				
				let dbIdentifier = row['database_identifier']
				let smiles = row['smiles']
				let inchi = row['inchi']
				let name = row['metabolite_identification']

				if(name && name != ""){
					const promise = this.getCompound(name, 'name')
					promises.push(promise)
				}else{
					if(dbIdentifier && dbIdentifier != ""){
						const promise = this.getCompound(dbIdentifier, 'databaseid')
						promises.push(promise)
					}else{							
						if(smiles && smiles != ""){
							const promise = this.getCompound(smiles, 'smiles')
							promises.push(promise)
						}else{
							if(inchi && inchi != ""){
								const promise = this.getCompound(inchi, 'inchi')
								promises.push(promise)
							}
						}
					}
				}
			})

			Promise.all(promises).then(data => {
				data.forEach(d => {
					if(d){
						this.mafData.data.rows.forEach( row =>{
							if( row['database_identifier'] == d.content[0]['databaseId'] || row['smiles'] == d.content[0]['smiles'] || row['inchi'] == d.content[0]['inchi'] || row['metabolite_identification'] == d.content[0]['name'] ){
								let details = d.content[0]
								if(details){
									if(this.isEmpty(row['database_identifier'])){
										row['database_identifier'] = details['databaseId']
									}
									if(this.isEmpty(row['chemical_formula'])){
										row['chemical_formula'] = details['formula']
									}
									if(this.isEmpty(row['inchi'])){
										row['inchi'] = details['inchi']
									}
									if(this.isEmpty(row['metabolite_identification'])){
										row['metabolite_identification'] = details['name']
									}
									if(this.isEmpty(row['smiles'])){
										row['smiles'] = details['smiles']
									}
								}
								this.rowsToUpdate.push(row)
							}
						})
					}
				})
				this.mafTable.updateRows(this.rowsToUpdate)
			})

			// contents.forEach(data => {
			// 	if(data){
			// 		let details = data.content[0]
			// 		let row = {}
			// 		if(details){
			// 			row['database_identifier'] = details['databaseId']
			// 			row['chemical_formula'] = details['formula']
			// 			row['inchi'] = details['inchi']
			// 			row['metabolite_identification'] = details['name']
			// 			row['smiles'] = details['smiles']
			// 		}
			// 		this.mafTable.updateRows([row]);
			// 	}
			// })
			
		}
	}

	isEmpty(val){
		return (!val && val == "") ? true : false
	}

	async getCompound(id, type){
		return await this.editorService.search(id, type).toPromise()
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
		this.editorService.search(term, type.toLowerCase()).subscribe( res => {
			let resultObj = res.content[0]
			this.isFormBusy = false;
			let fields = ['name', 'smiles', 'inchi', 'databaseId']
			fields.forEach(field =>{
				if(field != term){
					this.form.get(field).setValue(resultObj[field], {emitEvent: false})
				}
			})
			this.getChebiId()
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

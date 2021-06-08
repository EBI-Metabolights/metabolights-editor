import { select } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assays-container',
  templateUrl: './assays-container.component.html',
  styleUrls: ['./assays-container.component.css']
})
export class AssaysContainerComponent implements OnInit {

  @select(state => state.study.assays) studyAssays;
	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;

	assays: any = [];
	currentSubIndex: number = 0; 
	assaysNames: any = []

  	constructor() { 
  		this.studyAssays.subscribe(value => {
			let assayNames = Object.keys(value)
			if(assayNames.length > 0){
				assayNames.forEach( assayName => {
					if(this.assaysNames.indexOf(assayName) == -1){
						this.assays.push(value[assayName])
						this.assaysNames.push(assayName)
						this.assays.sort(function(a, b){
							if(a.name < b.name) { return -1; }
							if(a.name > b.name) { return 1; }
							return 0;
						})
						
						let cti = 0
						this.assays.forEach(a => {
							if(a.name == assayName){
								this.currentSubIndex = cti
							}
							cti = cti + 1
						})
					}
				})
			}
		});
		this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
  	}

	  ngOnInit(){

	  }

	assayDeleted(name){
		let i = 0
		let assayIndex  = -1
		this.assays.forEach(assay => {
			if(assay.name == name){
				assayIndex = i
			}
			i = i +1
		})
		if(i > -1){
			this.assays.splice(assayIndex, 1) 
		}
		this.currentSubIndex = 0
		this.assaysNames.splice(this.assaysNames.indexOf(name), 1)
	}

  	selectCurrentSubTab(i){
		  this.currentSubIndex = i
	  }

}

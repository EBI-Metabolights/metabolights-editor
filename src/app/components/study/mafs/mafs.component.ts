import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-mafs',
	templateUrl: './mafs.component.html',
	styleUrls: ['./mafs.component.css']
})
export class MafsComponent implements OnInit {

	@Input('assayName') assayName: any;
	@select(state => state.study.assays) studyAssays;
	@select(state => state.study.mafs) studyMAFs;

	assays: any = [];
	mafs: any = [];
	currentSubIndex: number = 0; 

	constructor() { }

	ngOnInit() {
		this.studyAssays.subscribe(value => { 
			this.assays = value
		});
		this.studyMAFs.subscribe(value => { 
			this.mafs = []
			if(this.assayName && this.assays){
				this.assays[this.assayName]['mafs'].forEach(maf =>{
					this.mafs.push(value[maf])
				})
			}else{
				this.mafs = Object.values(value)
			}
		});
	}

	selectCurrentSubTab(i){
		this.currentSubIndex = i
	}

}

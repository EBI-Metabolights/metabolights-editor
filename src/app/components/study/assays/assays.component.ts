import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'mtbls-assays',
  templateUrl: './assays.component.html',
  styleUrls: ['./assays.component.css']
})
export class AssaysComponent implements OnInit {

	@select(state => state.study.assays) studyAssays;
	assays: any = [];
	currentSubIndex: number = 0; 

  	constructor() { 
  		this.studyAssays.subscribe(value => { 
			this.assays = Object.values(value)
		});
  	}

  	ngOnInit() {
  	}

  	selectCurrentSubTab(i){
		this.currentSubIndex = i
	}

}

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
      if(this.assays.length > 0){
        this.assays.sort(function(a, b){
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        })  
      }
		});
  	}

  	ngOnInit() {
  	}

  	selectCurrentSubTab(i){
		  this.currentSubIndex = i
	  }
}

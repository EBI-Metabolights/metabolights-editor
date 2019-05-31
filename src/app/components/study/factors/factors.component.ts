import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-factors',
	templateUrl: './factors.component.html',
	styleUrls: ['./factors.component.css']
})
export class FactorsComponent implements OnInit {

	@select(state => state.study.factors) studyFactors;

	factors: any = null;
	
	constructor() { 
		this.studyFactors.subscribe(value => { 
			this.factors = value;
		});
	}

	ngOnInit() {
	}

}

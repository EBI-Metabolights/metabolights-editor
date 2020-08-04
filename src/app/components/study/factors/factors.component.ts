import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-factors',
	templateUrl: './factors.component.html',
	styleUrls: ['./factors.component.css']
})
export class FactorsComponent implements OnInit {

	@select(state => state.study.factors) studyFactors;
	@select(state => state.study.readonly) readonly;
	
	isReadOnly: boolean = false;
	factors: any = null;
	
	constructor() { 
		this.studyFactors.subscribe(value => { 
			this.factors = value;
		});
	}

	ngOnInit() {
		this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
	}

}

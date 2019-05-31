import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'assay-details',
  templateUrl: './assay-details.component.html',
  styleUrls: ['./assay-details.component.css']
})
export class AssayDetailsComponent implements OnInit {

	@Input('assayName') assayName: any;
	@select(state => state.study.assays) assays;

	assay: any = null;

  	constructor() { }

  	ngOnInit() {
  		this.assays.subscribe(value => { 
			  this.assay = value[this.assayName];
		  });
  	}

}

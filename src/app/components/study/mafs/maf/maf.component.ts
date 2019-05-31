import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mtbls-maf',
  templateUrl: './maf.component.html',
  styleUrls: ['./maf.component.css']
})
export class MafComponent implements OnInit {

	@Input('value') value: any;

  	constructor() {
  	}

  	ngOnInit() {
  	}

}

import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-status',
	templateUrl: './status.component.html',
	styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

	@select(state => state.study.status) studyStatus;

	isModalOpen: boolean = false;
	isFormBusy: boolean = false;
	status: string = null

	constructor(){ 
		this.studyStatus.subscribe(value => { 
			if(value != null){
				this.status = value
			}
		});
	}

	ngOnInit() {}

	openModal() {
		this.isModalOpen = true
	}

	closeModal() {
		this.isModalOpen = false
	}
}

import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
	selector: 'mtbls-release-date',
	templateUrl: './release-date.component.html',
	styleUrls: ['./release-date.component.css']
})
export class ReleaseDateComponent implements OnInit {
	@select(state => state.study.releaseDate) studyReleaseDate;
	isModalOpen: boolean = false;
	isFormBusy: boolean = false;

	releaseDate: Date = null;

	constructor() {
		this.studyReleaseDate.subscribe(value => { 
			if(value != null){
				this.releaseDate = value
			}
		});
	}

	ngOnInit() {
	}

	openModal() {
		this.isModalOpen = true
	}

	closeModal() {
		this.isModalOpen = false
	}

}

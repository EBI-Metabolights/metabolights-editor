import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';


@Component({
	selector: 'mtbls-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

	@Input('mode') mode: string = 'button';
	@Input('size') size: string = 'is-small';

	isUploadModalOpen: boolean = false;

	constructor(private fb: FormBuilder) { }

	ngOnInit() {
	}

	uploadComplete(){
		this.closeUploadModal()
	}

	openUploadModal(){
		this.isUploadModalOpen = true;
	}

	closeUploadModal(){
		this.isUploadModalOpen = false;	
	}
}

import { Component, OnInit, Input } from '@angular/core';
import { MetabolightsService } from '../../../../services/metabolights/metabolights.service';
import { NgRedux, select } from '@angular-redux/store';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';

@Component({
	selector: 'mtbls-ftp',
	templateUrl: './ftp.component.html',
	styleUrls: ['./ftp.component.css']
})
export class FTPComponent implements OnInit {

	isFTPUploadModalOpen: boolean = false;
	@select(state => state.study.uploadLocation) uploadLocation;
	@select(state => state.study.validations) validations: any;

	validationsId = 'upload';
	displayHelpModal: boolean = false;

    uploadPath: string = '';

	constructor(private fb: FormBuilder, private metabolightsService: MetabolightsService){ 
		this.uploadLocation.subscribe(value => { 
			this.uploadPath = value
		})
	}

	toggleHelp() {
		this.displayHelpModal = !this.displayHelpModal;
	}

	ngOnInit() {
	}

	openUploadModal(){
		this.isFTPUploadModalOpen = true;
	}

	closeUploadModal(){
		this.isFTPUploadModalOpen = false;	
	}
}

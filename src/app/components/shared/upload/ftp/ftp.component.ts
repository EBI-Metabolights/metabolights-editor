import { Component, OnInit } from '@angular/core';
import { MetabolightsService } from '../../../../services/metabolights/metabolights.service';
import { select } from '@angular-redux/store';
import { FormBuilder} from '@angular/forms';

@Component({
	selector: 'mtbls-ftp',
	templateUrl: './ftp.component.html',
	styleUrls: ['./ftp.component.css']
})
export class FTPUploadComponent implements OnInit {

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

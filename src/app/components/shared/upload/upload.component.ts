import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder} from '@angular/forms';

@Component({
	selector: 'mtbls-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

	@Input('mode') mode: string = 'button';
	@Input('size') size: string = 'is-small';

	@Input('file') file: string = null;
	@Input('multiple') allowMultipleSelection: boolean = true;
	@Input('type') type: string = 'file';
	@Input('fileTypes') fileTypes: any = {
        filter_name : "All types",
        extensions : ["*"]
    };

	@Output() complete = new EventEmitter<any>();
	isUploadModalOpen: boolean = false;

	constructor(private fb: FormBuilder) { }

	ngOnInit() {
	}

	uploadComplete(){
		this.complete.emit();
		this.closeUploadModal()
	}

	openUploadModal(){
		this.isUploadModalOpen = true;
	}

	closeUploadModal(){
		this.isUploadModalOpen = false;	
	}
}

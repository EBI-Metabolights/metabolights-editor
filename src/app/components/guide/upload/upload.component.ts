import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../store';
import { MTBLSPerson } from './../../../models/mtbl/mtbls/mtbls-person';
import { Ontology } from './../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from './../../../models/mtbl/mtbls/mtbls-publication';
import {JsonConvert, OperationMode, ValueCheckingMode} from "json2typescript"
import * as toastr from 'toastr';
import {Router} from "@angular/router";

import { EditorService } from './../../../services/editor.service';

@Component({
  selector: 'raw-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class RawUploadComponent implements OnInit {
	
	@select(state => state.status.user) studyUser;
	@select(state => state.study.identifier) studyIdentifier;
	@select(state => state.study.files) studyFiles;
  	user: any = null;
	requestedStudy: string = null;
	files: any = {};
	isLoading: boolean = false;

	constructor(private ngRedux: NgRedux<IAppState>,  private route: ActivatedRoute, private router: Router, private editorService: EditorService) { 
		this.editorService.initialiseStudy(this.route)
	    this.studyUser.subscribe(value => { 
	      this.user = value;
	      this.user.checked = true;
	    });
	    this.studyIdentifier.subscribe(value => { 
	      this.requestedStudy = value;
	    });
	    this.studyFiles.subscribe(value => { 
	      this.files = value;
	    });
	}

  	ngOnInit() {
  	}

  	isFolder(file){
        return !(file.file.indexOf(".") > -1)
    }

  	ngAfterViewInit() {
  	}

  	refreshFiles(){
  		this.editorService.loadStudyFiles();
  	}

  	copyFilesAndProceed(){
  		this.isLoading = true
  		this.editorService.syncStudyFiles({files: []}).subscribe( resp => {
			this.isLoading = false
			this.router.navigate(['/guide/meta', this.requestedStudy])
		})
    }
}

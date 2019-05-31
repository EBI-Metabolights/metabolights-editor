import { Component, OnInit, Input } from '@angular/core';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { NgRedux, select } from '@angular-redux/store';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';

@Component({
	selector: 'mtbls-download',
	templateUrl: './download.component.html',
	styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

	@Input('value') file: string;
	@select(state => state.study.obfuscationCode) obfuscationCode;

	domain = "";
	code = ""
	
	constructor(private fb: FormBuilder, private metabolightsService: MetabolightsService) {
		this.obfuscationCode.subscribe(value => { 
			this.code = value
		})
	}

	ngOnInit() {
	}

	getDownloadLink(){
		return this.metabolightsService.downloadURL(this.file, this.code)
	}

}

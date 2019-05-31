import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';

@Component({
  selector: 'mtbls-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css']
})
export class PublicationsComponent implements OnInit {

	@select(state => state.study.publications) studyPublications;
	@Input('validations') studyValidations: any;

	publications: any = null;


	constructor() {
		this.studyPublications.subscribe(value => { 
            this.publications = value;
        });
	}

	ngOnInit() { }
}


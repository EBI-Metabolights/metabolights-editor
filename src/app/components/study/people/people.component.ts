import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { IAppState } from '../../../store';
import { NgRedux, select } from '@angular-redux/store';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as toastr from 'toastr';

@Component({
  selector: 'mtbls-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {

	@select(state => state.study.people) people;
	@select(state => state.study.readonly) readonly;
	isReadOnly: boolean = false;
	validationsId = 'people';
	  
	constructor( private fb: FormBuilder, private metabolightsService: MetabolightsService, private ngRedux: NgRedux<IAppState>) { }
	ngOnInit() { 
		this.readonly.subscribe(value => { 
			if(value != null){
				this.isReadOnly = value
			}
		});
	}
}

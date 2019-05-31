import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';

@Component({
  selector: 'study-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css']
})
export class ValidationsComponent implements OnInit {

  studyValidation: any = null;
  displayOption: string = 'all';
  @select(state => state.study.validation) validation: any

  constructor() { }

  ngOnInit() {
  	this.validation.subscribe(value => { 
        this.studyValidation = value;
    });
  }

}

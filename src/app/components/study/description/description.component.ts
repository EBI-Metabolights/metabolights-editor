import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { IAppState } from '../../../store';
import { NgRedux, select } from '@angular-redux/store';
import { EditorService } from '../../../services/editor.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ValidateStudyDescription } from './description.validator';
import * as toastr from 'toastr';

@Component({
  selector: 'mtbls-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnChanges, OnInit {
  @select(state => state.study.abstract) studyDescription; 
  @select(state => state.study.validations) studyValidations: any

  @select(state => state.study.studyDesignDescriptors) studyDesignDescriptors: any[]

  form: FormGroup;
  isFormBusy: boolean = false;
  description: string = '';
  validations: any;

  validationsId = 'description';

  isModalOpen: boolean = false;
  hasChanges: boolean = false;

  constructor( private fb: FormBuilder, private editorService: EditorService, private ngRedux: NgRedux<IAppState>) { 
    this.studyDescription.subscribe(value => { 
      if(value == ''){
        this.description = 'Please add your study title here';
      }else{
        this.description = value;  
      }
    });
  }

  ngOnInit() {
  }

  openModal() {
    this.initialiseForm()
    this.isModalOpen = true
  }

  initialiseForm() {
    // this.description = this.description.replace(new RegExp("<br />", 'g'), '\n')
    this.isFormBusy = false;
    this.form = this.fb.group({
      description:  [ this.description, ValidateStudyDescription(this.validation) ]
    });
  }

  closeModal() {
    this.form = null
    this.isModalOpen = false
  }

  save() {
    this.isFormBusy = true;
    this.editorService.saveAbstract(this.compileBody(this.form.get('description').value.replace(new RegExp('\n', 'g'), "<br />"))).subscribe( res => {
      this.form.get('description').setValue(res.description)
      this.form.markAsPristine()
      this.isFormBusy = false;

      toastr.success('Abstract updated.', "Success", {
        "timeOut": "2500",
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "extendedTimeOut": 0,
        "tapToDismiss": false
      })
    }, err => {
      this.isFormBusy = false
    });
  }

  compileBody(description) {
    return {
      'description': description,
    }
  }

  get validation() {
    return this.studyValidations[this.validationsId];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value != undefined){
      this.description = changes.value.currentValue
    }
    if (changes.studyValidations != undefined)
      this.studyValidations = changes.studyValidations.currentValue
  }
}

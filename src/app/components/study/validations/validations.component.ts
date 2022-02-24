import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { EditorService } from '../../../services/editor.service';
import * as toastr from 'toastr';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';

@Component({
  selector: 'study-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css']
})
export class ValidationsComponent implements OnInit {

  studyValidation: any = null;
  displayOption: string = 'error';
  defaultToastrOptions: any = {
    "timeOut": "2500",
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "extendedTimeOut": 0,
    "tapToDismiss": false
  }

    //dummy variable, remove
    detail = failedValidation.validations[0].details[6]

  

  @select(state => state.study.validation) validation: any
  @select(state => state.status.isCurator) isCurator;
	curator: boolean = false;

  constructor(private editorService: EditorService) { }

  ngOnInit() {
    this.studyValidation = failedValidation;

    /**Uncomment the below or the component will be toast */ 

  	/* this.validation.subscribe(value => { 
        this.studyValidation = value;
    });
    this.isCurator.subscribe(value => { 
			if(value != null){
				this.curator = value
			}
		});*/
  }

  refreshValidations(){
    this.editorService.refreshValidations().subscribe( res => {
      this.editorService.loadValidations()
      toastr.success(res.success, "Success", this.defaultToastrOptions)
    }, err => {
      toastr.success(
      'Validation refresh job is submitted. If your study is large, validations will take some time to refresh.' +
      'If your study validations are not refreshing please contact us.', "Success", this.defaultToastrOptions)
    });
  }

  overrideValidation(validation){
    let data = { 
      "validations": []
    }
    let val_seq = validation['val_sequence']
    let val_description = validation['message']
    let payload = {}
    payload[val_seq] = val_description
    data['validations'].push(payload)
    this.editorService.overrideValidations(data).subscribe( res => {
      toastr.success(res.success, "Successfully overriden the validation", this.defaultToastrOptions)
      this.refreshValidations()
    }, err => {
      toastr.error('Validation override failed', "Error", this.defaultToastrOptions)
    });
  }

  /**
   * Add a comment to the database (also doubles up for updating a comment)
   * @param comment - Comment to persist in the database
   * @param validation - The validation detail that the comment pertains to
   */
  addComment(comment, validation) {
    let data = {
      "val_sequence": validation['val_sequence'],
      "comment": comment
    }

    this.editorService.addComment(data).subscribe (res => {
      toastr.success(res.success, "Successfully posted the comment", this.defaultToastrOptions);
      this.refreshValidations();
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { EditorService } from '../../../services/editor.service';
import * as toastr from 'toastr';

@Component({
  selector: 'study-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css']
})
export class ValidationsComponent implements OnInit {

  studyValidation: any = null;
  displayOption: string = 'error';

  @select(state => state.study.validation) validation: any
  @select(state => state.status.isCurator) isCurator;
	curator: boolean = false;

  constructor(private editorService: EditorService) { }

  ngOnInit() {
    this.openStateSubscriptions();
  }

  openStateSubscriptions() {
    this.validation.subscribe(value => { 
      this.studyValidation = value;
  });
  this.isCurator.subscribe(value => { 
    if(value != null){
      this.curator = value
    }
  });
  }

  refreshValidations(){
    this.editorService.refreshValidations().subscribe( res => {
      this.editorService.loadValidations()
      toastr.success(res.success, "Success", {
        "timeOut": "2500",
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "extendedTimeOut": 0,
        "tapToDismiss": false
      })
    }, err => {
      toastr.success('Validation refresh job is submitted. If your study is large, validations will take some time to refresh. If your study validations are not refreshing please contact us.', "Success", {
        "timeOut": "2500",
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "extendedTimeOut": 0,
        "tapToDismiss": false
      })
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
      toastr.success(res.success, "Successfully overriden the validation", {
        "timeOut": "2500",
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "extendedTimeOut": 0,
        "tapToDismiss": false
      })
      this.refreshValidations()
    }, err => {
      toastr.error('Validation override failed', "Success", {
        "timeOut": "2500",
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "extendedTimeOut": 0,
        "tapToDismiss": false
      })
    });
  }

}

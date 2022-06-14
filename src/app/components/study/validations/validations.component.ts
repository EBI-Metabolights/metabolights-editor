import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { EditorService } from '../../../services/editor.service';
import * as toastr from 'toastr';

@Component({
  selector: 'study-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css']
})
export class ValidationsComponent implements OnInit, AfterViewInit {

  studyValidation: any = null;
  displayOption: string = 'error';
  defaultToastrOptions: any = {
    "timeOut": "2500",
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "extendedTimeOut": 0,
    "tapToDismiss": false
  }



  /**Extraordinary bad practice to have a testing flag, but attempts to mock out the select have failed. The state library itself is also long unmaintained. */
  isTesting: boolean = false;

  @select(state => state.study.validation) validation: any
  @select(state => state.status.isCurator) isCurator;
  curator: boolean = false;

  constructor(private editorService: EditorService) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.setUpSubscriptions();

  }

  setUpSubscriptions() {
    
    this.validation.subscribe(value => {
      this.studyValidation = value;
    });
    this.isCurator.subscribe(value => {
      if (value != null) {
        this.curator = value
      }
    });
  }

  refreshValidations() {
    this.editorService.refreshValidations().subscribe(res => {
      this.editorService.loadValidations()
      toastr.success(res.success, "Success", this.defaultToastrOptions)
    }, err => {
      toastr.success(
      'Validation refresh job is submitted. If your study is large, validations will take some time to refresh.' +
      'If your study validations are not refreshing please contact us.', "Success", this.defaultToastrOptions)
    });
  }

  overrideValidation(validation) {
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
   * Handle a saved comment 
   * @param $event - The comment emitted from a child component
   * @param detail - the validation detail that the comment pertains to
   */
  handleCommentSaved($event, detail){
    console.log($event, detail)
    let data = {
      "comments": []
    }
    let payload ={}
    payload[detail.val_sequence] = $event['comment'];
    data['comments'].push(payload)
    
    console.log(data);
    this.editorService.addComment(data).subscribe (res => {
      toastr.success(res.success, "Successfully posted the comment", this.defaultToastrOptions);
      this.refreshValidations();
    }) 
  }


}

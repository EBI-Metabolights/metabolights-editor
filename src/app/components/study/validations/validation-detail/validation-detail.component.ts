import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as toastr from 'toastr';
import { EditorService } from '../../../../services/editor.service';


export interface ValidationDetail {
  message: string;
  section: string;
  val_sequence: string;
  status: string;
  metadata_file: string;
  value: string;
  description: string;
  val_override: string;
  val_message: string;
  comment?: string;
  [key: string]: string
}

@Component({
  selector: 'app-validation-detail',
  templateUrl: './validation-detail.component.html',
  styleUrls: ['./validation-detail.component.css']
})
export class ValidationDetailComponent implements OnInit {

  @Input() isCurator: boolean;
  @Input() validationDetail: ValidationDetail
  @Output() commentSaved: EventEmitter<{comment: string}> = new EventEmitter();

  /**Validation detail rendering flags */
  panelOpenState: boolean = true;
  disabled: boolean = null;
  hasDescription: boolean = false;

  displayOption: string = 'error';
  defaultToastrOptions: any = {
    "timeOut": "2500",
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "extendedTimeOut": 0,
    "tapToDismiss": false
  }


  // dummy variables, remove
  // validation = failedValidation.validations[0].details[6];
  // curator = false;

  constructor(private editorService: EditorService) { }

  ngOnInit(): void {
    this.disabled = this.decideIfDisabled();
    this.isNotNaN(this.validationDetail.description) ? this.hasDescription = true : this.hasDescription = false
  }

  isNotNaN(desc): boolean {
    if (typeof desc === null) { return false }
    if (typeof desc === undefined) { return false}
    if (typeof desc === 'string' && desc.length === 0) { return false }
    if (typeof desc === 'string' && desc.length > 0) { return true }
  }

  /**
   * Decide whether or not to expose the comment box to the user or curator. We only want a curator to leave a comment if the validation
   *  status is error or warning. We only want the user to be able to
   * @returns a boolean value indicating whether the comment box is disabled.
   */
  decideIfDisabled(): boolean {
    if (this.isCurator) {
      if(this.validationDetail.status === 'error' || this.validationDetail.status === 'warning') {
        return false
      }
    } else {
      if (this.validationDetail.comment) {
        return false
      }
    }
    return true;
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

  propagateComment($event) {
    this.commentSaved.emit($event)
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

}

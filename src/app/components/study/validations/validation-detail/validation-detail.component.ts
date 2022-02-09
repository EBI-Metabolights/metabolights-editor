import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { failedValidation } from 'src/app/models/mtbl/mtbls/mocks/mock-validation';


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
  comment: string;
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

  /**Validation detail rendering flags */
  panelOpenState: boolean = true;
  disabled: boolean = null;
  hasDescription: boolean = false;
  

  // dummy variables, remove
  validation = failedValidation.validations[0].details[6];
  curator = false;

  constructor() { }

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
   * Decide whether or not to expose the cooment box to the user or curator. We only want a curator to leave a comment if the validation
   *  status is error or warning. We only want the user to be able to 
   * @returns a boolean value indicating whether the comment box is disabled.
   */
  decideIfDisabled(): boolean {
    if (this.curator) {
      console.log(this.validationDetail.status)
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



  propagateComment($event) {
    console.log($event);
    // send it off to the service here
  }

}

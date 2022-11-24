import { Directive, EventEmitter, Input, Output } from "@angular/core";
/* eslint-disable @angular-eslint/directive-class-suffix*/
//ultimately did not have a use for this, but leaving here as it establishes a handy mocking pattern.
@Directive({
  selector: "app-validation-detail-comment", //eslint-disable-line @angular-eslint/directive-selector
})
export class MockValidationDetailCommentComponent {
  @Input() curator: boolean;
  @Input() comment?: string;
  @Output() commentSaved: EventEmitter<{ comment: string }> =
    new EventEmitter();
}

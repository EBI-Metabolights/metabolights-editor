import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";

export type CommentBoxStatus =
  | "Leave a comment"
  | "Comment saved"
  | "Update a comment";

@Component({
  selector: "app-validation-detail-comment",
  templateUrl: "./validation-detail-comment.component.html",
  styleUrls: ["./validation-detail-comment.component.css"],
})
export class ValidationDetailCommentComponent implements OnInit {
  @Input() curator: boolean;
  @Input() comment?: string;

  @Output() commentSaved: EventEmitter<{ comment: string }> =
    new EventEmitter();

  disableCuratorCommentBox = false;
  commentBoxStatus: CommentBoxStatus = "Leave a comment";

  monoForm = new UntypedFormGroup({
    commentControl: new UntypedFormControl(""),
  });

  constructor() {}

  ngOnInit(): void {
    if (this.comment) {
      this.monoForm.setValue({ commentControl: this.comment });
    }

  }

  saveComment() {
    this.commentSaved.emit({ comment: this.monoForm.value.commentControl });
    this.disableCuratorCommentBox = true;
    this.monoForm.controls.commentControl.disable();
    this.commentBoxStatus = "Comment saved";
  }

  onEditCommentClick() {
    this.disableCuratorCommentBox = false;
    this.monoForm.controls.commentControl.enable();
    this.commentBoxStatus = "Update a comment";
  }
}

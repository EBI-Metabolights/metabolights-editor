import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [MatCardModule, NgIf],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.css',
    standalone: true
})
export class ConfirmationDialogComponent{
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure?';
  @Input() moreinfo: string = 'click here for more information';
  @Input() actionType: string = 'confirm'; // 'confirm' or 'info'

  @Output() confirm = new EventEmitter<boolean>();

  onConfirm() {
    this.confirm.emit(true);
  }

  onCancel() {
    this.confirm.emit(false);
  }
  onClose() {
    this.confirm.emit(true);
  }
}

import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FullOverride } from '../../interfaces/validation-report.interface';

@Component({
  selector: 'app-delete-override-dialog',
  templateUrl: './delete-override-dialog.component.html',
  styleUrl: './delete-override-dialog.component.css'
})
export class DeleteOverrideDialogComponent {
  @Input() override: FullOverride;
  @Output() deleteConfirmed = new EventEmitter<void>(); // EventEmitter

  constructor(
    public dialogRef: MatDialogRef<DeleteOverrideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false); // Emit cancellation
  }

  onDelete(): void {
    this.deleteConfirmed.emit(); // Emit the event
    this.dialogRef.close(true); // Optionally close the dialog
  }
}

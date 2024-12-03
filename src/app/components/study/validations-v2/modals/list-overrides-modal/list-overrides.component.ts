import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FullOverride } from '../../interfaces/validation-report.interface';
import { MatDialog } from '@angular/material/dialog';
import { OverrideModalComponent } from '../override-modal/override-modal.component';
import { DeleteOverrideDialogComponent } from '../delete-override-dialog/delete-override-dialog.component';

@Component({
  selector: 'list-overrides',
  templateUrl: './list-overrides.component.html',
  styleUrl: './list-overrides.component.css'
})
export class ListOverridesComponent {

  @Input() overrides: Array<FullOverride>;
  @Input() isCurator: boolean;

  @Output() closeEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<string>();

  displayedColumns: string[] = ['rule_id', 'title', 'new_type', 'curator', 'created_at', 'actions'];

  constructor(private dialog: MatDialog) {
    
  }

  close() {
    this.closeEvent.emit('closed');
  }

  openDeleteDialog(override: FullOverride): void {
    const dialogRef = this.dialog.open(DeleteOverrideDialogComponent, {
      width: '400px'
    });

    const dialogInstance = dialogRef.componentInstance;
    dialogInstance.override = override;
    dialogRef.componentInstance.deleteConfirmed.subscribe(() => {
      this.deleteEvent.emit(`${override.override_id}`);
    })

  }

  openEditDialog(override: FullOverride): void {
    const dialogRef = this.dialog.open(OverrideModalComponent, {
      width: '400px'
    });
  }


}

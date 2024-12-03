import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FullOverride } from '../../interfaces/validation-report.interface';

@Component({
  selector: 'list-overrides',
  templateUrl: './list-overrides.component.html',
  styleUrl: './list-overrides.component.css'
})
export class ListOverridesComponent {

  @Input() overrides: Array<FullOverride>;
  @Input() isCurator: boolean;

  @Output() closeEvent = new EventEmitter<any>();

  displayedColumns: string[] = ['rule_id', 'title', 'new_type', 'curator', 'created_at', 'actions'];

  close() {
    this.closeEvent.emit('closed');
  }


}

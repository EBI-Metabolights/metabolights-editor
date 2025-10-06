import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'metadata-modifiers-modal',
  standalone: false,
  templateUrl: './metadata-modifiers-modal.component.html',
  styleUrl: './metadata-modifiers-modal.component.css'
})
export class MetadataModifiersModalComponent {
  @Input() modifierMetadataFileUpdates: string[] = [];

  @Output() closeEvent = new EventEmitter<void>();
  displayedColumns: string[] = ['source', 'action', 'oldValue', 'newValue'];


  close() {
    this.closeEvent.emit();
  }
  copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => {
    });
  }
}

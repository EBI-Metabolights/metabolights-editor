import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mtbls-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isModalOpen: boolean = false;
  @Input() isBusy: boolean = false;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}

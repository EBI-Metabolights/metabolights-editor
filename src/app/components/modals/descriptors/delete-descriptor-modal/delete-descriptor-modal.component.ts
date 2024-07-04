import { OverlayRef } from '@angular/cdk/overlay';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MODAL_CONFIG } from 'src/app/services/modals/descriptors-modals.service';

@Component({
  selector: 'app-delete-descriptor-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-descriptor-modal.component.html',
  styleUrl: './delete-descriptor-modal.component.css'
})
export class DeleteDescriptorModalComponent {
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() cancelEvent = new EventEmitter<any>();

  constructor(
    private overlayRef: OverlayRef,
    @Inject(MODAL_CONFIG) public config: any
  ) {}

  close() {
    this.overlayRef.dispose();
  }

  delete() {
    this.deleteEvent.emit({ data: 'delete' });
    this.close();
  }

  cancel() {
    this.cancelEvent.emit({data: 'cancel' });
    this.close();
  }
}
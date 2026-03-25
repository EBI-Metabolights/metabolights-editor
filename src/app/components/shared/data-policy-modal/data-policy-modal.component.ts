import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';

@Component({
  selector: 'data-policy-modal',
  standalone: false,
  templateUrl: './data-policy-modal.component.html',
  styleUrl: './data-policy-modal.component.css'
})
export class DataPolicyModalComponent {

  @Output() confirm = new EventEmitter<boolean>();

  scrolledToBottom = false;

  constructor(private store: Store) {
    this.store.dispatch(new Loading.Disable());
  }
   
 onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    if (atBottom) {
      this.scrolledToBottom = true;
    }
  }

  onAgree() {
    this.confirm.emit(true);
  }

  onClose() {
    this.confirm.emit(false);
  }
}

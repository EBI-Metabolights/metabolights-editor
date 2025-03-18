import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';

@Component({
  selector: 'app-data-policy',
  standalone: false,
  templateUrl: './data-policy.component.html',
  styleUrl: './data-policy.component.css'
})
export class DataPolicyComponent {

  constructor(private store: Store) {
    this.store.dispatch(new Loading.Disable());
  }
}

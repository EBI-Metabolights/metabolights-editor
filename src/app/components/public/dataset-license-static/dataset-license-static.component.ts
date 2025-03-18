import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';

@Component({
  selector: 'app-dataset-license-static-page',
  standalone: false,
  templateUrl: './dataset-license-static.component.html',
  styleUrl: './dataset-license-static.component.css'
})
export class DatasetLicenseStaticPageComponent {
  constructor(private store: Store) {
    this.store.dispatch(new Loading.Disable());
  }
}

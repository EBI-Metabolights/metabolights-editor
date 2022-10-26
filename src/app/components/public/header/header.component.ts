import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mtbls-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @select((state) => state.status.user) user;

  authUser: any = null;
  query = '';

  constructor() {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
  }

  setUpSubscription() {
    this.user.subscribe((value) => {
      if (value != null) {
        this.authUser = value;
      }
    });
  }

  sendQuery() {
    window.location.href = '/metabolights/search?freeTextQuery=' + this.query;
  }
}

import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Store } from "@ngrx/store";
import { selectUser } from "src/app/state/user.selectors";

@Component({
  selector: "mtbls-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
  user$ = this.store.select(selectUser)

  authUser: any = null;
  query = "";

  constructor(private store: Store) {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
  }

  setUpSubscription() {
    this.user$.subscribe(user => {
      if (user !== null) this.authUser = user;
    })
  }

  sendQuery() {
    window.location.href = "/metabolights/search?freeTextQuery=" + this.query;
  }
}

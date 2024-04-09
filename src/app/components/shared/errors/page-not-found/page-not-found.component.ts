import { IAppState } from "./../../../../store";
import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";

@Component({
  selector: "app-page-not-found",
  templateUrl: "./page-not-found.component.html",
  styleUrls: ["./page-not-found.component.css"],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private ngRedux: NgRedux<IAppState>, private store: Store) {}

  ngOnInit() {
    if (environment.useNewState) {
      this.store.dispatch(new Loading.Disable())
    } else {
      if (!environment.isTesting) {
        this.ngRedux.dispatch({ type: "DISABLE_LOADING" });
      }
    }

  }
}

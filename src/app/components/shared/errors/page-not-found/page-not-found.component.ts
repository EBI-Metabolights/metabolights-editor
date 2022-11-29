import { IAppState } from "./../../../../store";
import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Store } from "@ngrx/store";
import { setLoadingDisabled } from "src/app/state/meta-settings.actions";

@Component({
  selector: "app-page-not-found",
  templateUrl: "./page-not-found.component.html",
  styleUrls: ["./page-not-found.component.css"],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private ngRedux: NgRedux<IAppState>, private store: Store) {}

  ngOnInit() {
    if (!environment.isTesting) {
      this.ngRedux.dispatch({ type: "DISABLE_LOADING" });

      this.store.dispatch(setLoadingDisabled());
    }
  }
}

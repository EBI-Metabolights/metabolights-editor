import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";

@Component({
    selector: "app-page-not-found",
    templateUrl: "./page-not-found.component.html",
    styleUrls: ["./page-not-found.component.css"],
    standalone: false
})
export class PageNotFoundComponent implements OnInit {
  constructor (private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new Loading.Disable())
  }
}

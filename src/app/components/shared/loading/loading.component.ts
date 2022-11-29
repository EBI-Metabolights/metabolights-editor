import { Component, OnInit } from "@angular/core";
import { select } from "@angular-redux/store";
import { Store } from "@ngrx/store";
import { selectLoading, selectLoadingInfo } from "src/app/state/meta-settings.selector";

@Component({
  selector: "mtbls-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"],
})
export class LoadingComponent implements OnInit {

  //old state
  @select((state) => state.status.loading) isLoading: boolean;
  @select((state) => state.status.info) loadingInformation: string;


  //new state
  loading$ = this.store.select(selectLoading);
  loadingInfo$ = this.store.select(selectLoadingInfo);

  constructor(private store: Store) {}

  ngOnInit() {}
}

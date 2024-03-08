import { Component, OnInit } from "@angular/core";
import { select } from "@angular-redux/store";
import { PlatformLocation } from "@angular/common";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "mtbls-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"],
})
export class LoadingComponent implements OnInit {
  @select((state) => state.status.loading) isLoading: boolean;
  @select((state) => state.status.info) loadingInformation: string;

  @Select(TransitionsState.loading) loading$: Observable<boolean>
  @Select(TransitionsState.loadingInformation) loadingInformation$: Observable<string>;
  baseHref: string;

  constructor(private platformLocation: PlatformLocation) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  ngOnInit() {}
}

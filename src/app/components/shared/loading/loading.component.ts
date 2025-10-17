import { Component, inject, OnInit } from "@angular/core";
import { PlatformLocation } from "@angular/common";
import { TransitionsState } from "src/app/ngxs-store/non-study/transitions/transitions.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
    selector: "mtbls-loading",
    templateUrl: "./loading.component.html",
    styleUrls: ["./loading.component.css"],
    standalone: false
})
export class LoadingComponent implements OnInit {

  loading$: Observable<boolean> = inject(Store).select(TransitionsState.loading);
  loadingInformation$: Observable<string> = inject(Store).select(TransitionsState.loadingInformation);
  baseHref: string;

  constructor(private platformLocation: PlatformLocation) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  ngOnInit() {}
}

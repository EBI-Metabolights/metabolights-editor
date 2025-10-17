import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
    selector: "mtbls-factors",
    templateUrl: "./factors.component.html",
    styleUrls: ["./factors.component.css"],
    standalone: false
})
export class FactorsComponent implements OnInit {

  studyFactors$: Observable<MTBLSFactor[]> = inject(Store).select(DescriptorsState.studyFactors);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  

  isReadOnly = false;
  factors: any = null;

  constructor() {
    this.setUpConstructorSubscriptionNgxs();
  }

  ngOnInit() {
    this.setUpInitSubscriptionNgxs();
  }

  setUpConstructorSubscriptionNgxs() {
    this.studyFactors$.subscribe((value) => {
      this.factors = value;
    });
  }

  setUpInitSubscriptionNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }
}

import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/application.state";

@Component({
  selector: "mtbls-factors",
  templateUrl: "./factors.component.html",
  styleUrls: ["./factors.component.css"],
})
export class FactorsComponent implements OnInit {
  @select((state) => state.study.factors) studyFactors;
  @select((state) => state.study.readonly) readonly;

  @Select(DescriptorsState.studyFactors) studyFactors$: Observable<MTBLSFactor>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  

  isReadOnly = false;
  factors: any = null;

  constructor() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpConstructorSubscription();
    }
    if (environment.useNewState) this.setUpConstructorSubscriptionNgxs();
  }

  ngOnInit() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpInitSubscription();
    }
    if (environment.useNewState) this.setUpInitSubscriptionNgxs();
  }

  setUpConstructorSubscription() {
    this.studyFactors.subscribe((value) => {
      this.factors = value;
    });
  }

  setUpInitSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
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

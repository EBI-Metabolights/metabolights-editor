import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "mtbls-factors",
  templateUrl: "./factors.component.html",
  styleUrls: ["./factors.component.css"],
})
export class FactorsComponent implements OnInit {

  @Select(DescriptorsState.studyFactors) studyFactors$: Observable<MTBLSFactor>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  

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

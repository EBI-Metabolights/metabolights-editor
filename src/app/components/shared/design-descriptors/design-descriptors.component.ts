import { Component, OnInit, Input, Inject, SimpleChanges } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Select } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/application.state";
import { env } from "process";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
  selector: "mtbls-design-descriptors",
  templateUrl: "./design-descriptors.component.html",
  styleUrls: ["./design-descriptors.component.css"],
})
export class DesignDescriptorsComponent implements OnInit {
  @select((state) => state.study.studyDesignDescriptors) descriptors;
  @select((state) => state.study.validations) validations;
  @select((state) => state.study.readonly) readonly;

  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(DescriptorsState.studyDesignDescriptors) descriptors$: Observable<Ontology[]>;

  @Input("inline") inline: boolean;
  @Input("readOnly") readOnly: boolean;
  isReadOnly = false;

  constructor() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscription();
    }
    if (environment.useNewState) this.setUpSubscriptionNgxs();
  }

  setUpSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpSubscriptionNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  ngOnInit() {}
}

import { Component, OnInit, Input, Inject, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
import { Select } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
  selector: "mtbls-design-descriptors",
  templateUrl: "./design-descriptors.component.html",
  styleUrls: ["./design-descriptors.component.css"],
})
export class DesignDescriptorsComponent implements OnInit {

  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(DescriptorsState.studyDesignDescriptors) descriptors$: Observable<Ontology[]>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;
  
  @Input("inline") inline: boolean;
  @Input("readOnly") readOnly: boolean;
  isReadOnly = false;

  constructor() {
    this.setUpSubscriptionNgxs();
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

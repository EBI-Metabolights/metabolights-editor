import { Component, OnInit, Input, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { DescriptorsState } from "src/app/ngxs-store/study/descriptors/descriptors.state";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
  selector: "mtbls-design-descriptors",
  templateUrl: "./design-descriptors.component.html",
  styleUrls: ["./design-descriptors.component.css"],
})
export class DesignDescriptorsComponent implements OnInit {

  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  descriptors$: Observable<Ontology[]> = inject(Store).select(DescriptorsState.studyDesignDescriptors);
  
  @Input("inline") inline: boolean;
  @Input("readOnly") readOnly: boolean;
  @Input("isCreationFlow") isCreationFlow: boolean = false;
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

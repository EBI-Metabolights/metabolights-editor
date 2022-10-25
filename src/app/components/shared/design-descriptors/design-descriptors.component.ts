import { Component, OnInit, Input, Inject, SimpleChanges } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-design-descriptors",
  templateUrl: "./design-descriptors.component.html",
  styleUrls: ["./design-descriptors.component.css"],
})
export class DesignDescriptorsComponent implements OnInit {
  @select((state) => state.study.studyDesignDescriptors) descriptors;
  @select((state) => state.study.validations) validations;
  @select((state) => state.study.readonly) readonly;
  isReadOnly: boolean = false;

  @Input("inline") inline: boolean;
  @Input("readOnly") readOnly: boolean;

  constructor() {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
  }

  setUpSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  ngOnInit() {}
}

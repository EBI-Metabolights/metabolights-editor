import { Component, OnInit, Input } from "@angular/core";
import { select } from "@angular-redux/store";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "quick-link",
  templateUrl: "./quick-link.component.html",
  styleUrls: ["./quick-link.component.css"],
})
export class QuickLinkComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>

  @Input("path") path: string;
  @Input("icon") icon: string;
  @Input("text") text: string;
  requestedStudy: string = null;

  constructor(private router: Router) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscription();
    }
    if (environment.useNewState) this.setUpSubscriptionNgxs();
  }

  setUpSubscription() {
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
  }

  setUpSubscriptionNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
  }

  ngOnInit() {}

  navigate() {
    this.router.navigate([this.path, this.requestedStudy]);
  }
}

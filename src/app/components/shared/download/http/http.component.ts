import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { Select } from "@ngxs/store";

@Component({
  selector: "mtbls-download-http",
  templateUrl: "./http.component.html",
  styleUrls: ["./http.component.css"],
})
export class HttpDownloadComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;


  requestedStudy: any = null;

  constructor() {}

  ngOnInit() {
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
}

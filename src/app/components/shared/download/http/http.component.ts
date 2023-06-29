import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-download-http",
  templateUrl: "./http.component.html",
  styleUrls: ["./http.component.css"],
})
export class HttpDownloadComponent implements OnInit {
  @select((state) => state.study.identifier) studyIdentifier;

  requestedStudy: any = null;

  constructor() {}

  ngOnInit() {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
  }

  setUpSubscription() {
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
  }
}

import { Component, inject, OnInit } from "@angular/core";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";

@Component({
  selector: "mtbls-download-http",
  templateUrl: "./http.component.html",
  styleUrls: ["./http.component.css"],
})
export class HttpDownloadComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);


  requestedStudy: any = null;

  constructor() {}

  ngOnInit() {
    this.setUpSubscriptionNgxs();
  }

  setUpSubscriptionNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
  }
}

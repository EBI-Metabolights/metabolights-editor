import { Component, OnInit } from "@angular/core";
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
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;


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

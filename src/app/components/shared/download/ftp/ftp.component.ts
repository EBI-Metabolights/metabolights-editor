import { Component, inject, OnInit } from "@angular/core";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "mtbls-download-ftp",
  templateUrl: "./ftp.component.html",
  styleUrls: ["./ftp.component.css"],
})
export class FtpDownloadComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  publicFtpUrl$: Observable<string> = inject(Store).select(GeneralMetadataState.publicFtpUrl);
  requestedStudy: any = null;
  publicFtpUrl = null;
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
    this.publicFtpUrl$.subscribe((value) => {
      if (value != null) {
        this.publicFtpUrl = value;
      }
    });

  }
}

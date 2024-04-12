import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "mtbls-download-ftp",
  templateUrl: "./ftp.component.html",
  styleUrls: ["./ftp.component.css"],
})
export class FtpDownloadComponent implements OnInit {  
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

import { Component, inject, OnInit } from "@angular/core";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";

@Component({
  selector: "mtbls-download-globus",
  templateUrl: "./globus.component.html",
  styleUrls: ["./globus.component.css"],
})
export class GlobusDownloadComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  publicGlobusUrl$: Observable<string> = inject(Store).select(GeneralMetadataState.publicGlobusUrl);
  requestedStudy: any = null;
  publicGlobusUrl = null;
  displayHelpModal = false;
  constructor() {}

  ngOnInit() {
    this.setUpSubscriptionNgxs();
  }
  toggleHelp() {
    this.displayHelpModal = !this.displayHelpModal;
  }
  setUpSubscriptionNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.publicGlobusUrl$.subscribe((value) => {
      if (value != null) {
        this.publicGlobusUrl = value;
      }
    });
  }
}

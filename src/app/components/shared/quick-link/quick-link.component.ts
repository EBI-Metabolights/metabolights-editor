import { Component, OnInit, Input, inject } from "@angular/core";
import { Router } from "@angular/router";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";

@Component({
  selector: "quick-link",
  templateUrl: "./quick-link.component.html",
  styleUrls: ["./quick-link.component.css"],
})
export class QuickLinkComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  @Input("path") path: string;
  @Input("icon") icon: string;
  @Input("text") text: string;
  requestedStudy: string = null;

  constructor(private router: Router) {
    this.setUpSubscriptionNgxs();
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

import { Component, OnInit, Input } from "@angular/core";
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
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>

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

import {
  Component,
  OnInit,
  Input,
  inject
} from "@angular/core";

import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "mtbls-publications",
  templateUrl: "./publications.component.html",
  styleUrls: ["./publications.component.css"],
})
export class PublicationsComponent implements OnInit {
  @Input("validations") studyValidations: any;

  studyPublications$: Observable<IPublication[]> = inject(Store).select(GeneralMetadataState.publications);
  studyReadonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  

  isReadOnly = false;
  publications: any = null;
  expandedIndex = -1;

  constructor() {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.studyPublications$.subscribe((value) => {
      this.publications = value;
    });
    this.studyReadonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });

  }

  toggleExpand(index: number) {
    if (this.expandedIndex === index) {
      this.expandedIndex = -1;
    } else {
      this.expandedIndex = index;
    }
  }

  ngOnInit() {}
}

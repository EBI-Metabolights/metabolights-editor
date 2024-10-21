import {
  Component,
  inject,
  OnInit
} from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { UntypedFormBuilder } from "@angular/forms";
import * as toastr from "toastr";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface";
import { Store } from "@ngxs/store";

@Component({
  selector: "mtbls-people",
  templateUrl: "./people.component.html",
  styleUrls: ["./people.component.css"],
})
export class PeopleComponent implements OnInit {

  
  people$: Observable<IPerson[]> = inject(Store).select(GeneralMetadataState.people);
  studyReadonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);


  isReadOnly = false;
  validationsId = "people";
  people = []

  constructor(
    private fb: UntypedFormBuilder,
    private metabolightsService: MetabolightsService,
  ) {}
  ngOnInit() {
    this.setUpSubscriptionNgxs();
  }



  setUpSubscriptionNgxs() {
    this.studyReadonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
    this.people$.subscribe((value) => {
      this.people = value;
      
    })
  }


}

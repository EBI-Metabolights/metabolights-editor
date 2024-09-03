import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { UntypedFormBuilder, FormGroup, Validators } from "@angular/forms";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface";

@Component({
  selector: "mtbls-people",
  templateUrl: "./people.component.html",
  styleUrls: ["./people.component.css"],
})
export class PeopleComponent implements OnInit {

  
  @Select(GeneralMetadataState.people) people$: Observable<IPerson[]>;
  @Select(ApplicationState.readonly) studyReadonly$: Observable<boolean>;


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

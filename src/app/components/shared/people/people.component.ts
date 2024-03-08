import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { IAppState } from "../../../store";
import { NgRedux, select } from "@angular-redux/store";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";

@Component({
  selector: "mtbls-people",
  templateUrl: "./people.component.html",
  styleUrls: ["./people.component.css"],
})
export class PeopleComponent implements OnInit {
  @select((state) => state.study.people) people;
  @select((state) => state.study.readonly) readonly;
  
  @Select(GeneralMetadataState.people) studyPublications$: Observable<IPublication[]>;
  @Select(ApplicationState.readonly) studyReadonly$: Observable<boolean>;


  isReadOnly = false;
  validationsId = "people";

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService,
    private ngRedux: NgRedux<IAppState>
  ) {}
  ngOnInit() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscription();
    }
    if (environment.useNewState) this.setUpSubscriptionNgxs();
  }

  setUpSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  setUpSubscriptionNgxs() {
    this.studyReadonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }


}

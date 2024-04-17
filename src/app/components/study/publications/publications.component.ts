import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { Select } from "@ngxs/store";
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

  @Select(GeneralMetadataState.publications) studyPublications$: Observable<IPublication[]>;
  @Select(ApplicationState.readonly) studyReadonly$: Observable<boolean>;


  isReadOnly = false;
  publications: any = null;

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

  ngOnInit() {}
}

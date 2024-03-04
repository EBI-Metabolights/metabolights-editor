import { Component, OnInit, Input } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { Observable } from "rxjs";
import { Select } from "@ngxs/store";

@Component({
  selector: "mtbls-organisms",
  templateUrl: "./organisms.component.html",
  styleUrls: ["./organisms.component.css"],
})
export class OrganismsComponent implements OnInit {
  @select((state) => state.study.organisms) studyOrganisms;

  @Select(SampleState.organisms) studyOrganisms$: Observable<Record<string, any>>;
  
  organisms: any[] = [];

  constructor() {}

  ngOnInit() {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.studyOrganisms.subscribe((value) => {
      this.organisms = [];
      Object.keys(value).forEach((key) => {
        value[key].name = key;
        this.organisms.push(value[key]);
      });
    });
  }

  setUpSubscriptionsNgxs() {
    this.studyOrganisms$.subscribe((value) => {
      this.organisms = [];
      Object.keys(value).forEach((key) => {
        value[key].name = key;
        this.organisms.push(value[key]);
      });
    });
  }
}

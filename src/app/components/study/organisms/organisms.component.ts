import { Component, OnInit, Input } from "@angular/core";
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

  @Select(SampleState.organisms) studyOrganisms$: Observable<Record<string, any>>;
  
  organisms: any[] = [];

  constructor() {}

  ngOnInit() {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.studyOrganisms$.subscribe((value) => {
      this.organisms = [];
      if (value !== null) {
        Object.keys(value).forEach((key) => {
          value[key].name = key;
          this.organisms.push(value[key]);
        });
      }

    });
  }
}

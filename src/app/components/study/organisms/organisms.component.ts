import { Component, inject, OnInit } from "@angular/core";
import { SampleState } from "src/app/ngxs-store/study/samples/samples.state";
import { Observable } from "rxjs";
import { Select, Store } from "@ngxs/store";

@Component({
  selector: "mtbls-organisms",
  templateUrl: "./organisms.component.html",
  styleUrls: ["./organisms.component.css"],
})
export class OrganismsComponent implements OnInit {

  studyOrganisms$: Observable<Record<string, any>> = inject(Store).select(SampleState.organisms);
  
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

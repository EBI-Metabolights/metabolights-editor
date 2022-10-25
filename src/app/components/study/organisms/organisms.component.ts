import { Component, OnInit, Input } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-organisms",
  templateUrl: "./organisms.component.html",
  styleUrls: ["./organisms.component.css"],
})
export class OrganismsComponent implements OnInit {
  @select((state) => state.study.organisms) studyOrganisms;
  organisms: any[] = [];

  constructor() {}

  ngOnInit() {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyOrganisms.subscribe((value) => {
      this.organisms = [];
      Object.keys(value).forEach((key) => {
        value[key]["name"] = key;
        this.organisms.push(value[key]);
      });
    });
  }
}

import { Component, OnInit } from "@angular/core";
import { select } from "@angular-redux/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.css"],
})
export class LoadingComponent implements OnInit {
  @select((state) => state.status.loading) isLoading: boolean;
  @select((state) => state.status.info) loadingInformation: string;
  context = ""
  constructor() {}

  ngOnInit() {
    this.context = environment.contextPath
  }
}

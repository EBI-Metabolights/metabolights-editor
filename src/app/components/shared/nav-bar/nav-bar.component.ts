import { Component, OnInit, Input } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "./../../../store";
import { Router } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { environment } from "src/environments/environment";
@Component({
  selector: "nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.css"],
})
export class NavBarComponent implements OnInit {
  @Input("mode") mode: any;
  @select((state) => state.study.identifier) studyIdentifier: string;
  baseHref: string;
  endpoint = "";
  environmentName: string;

  constructor(
    public router: Router,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();

    this.environmentName = environment.context;
  }

  ngOnInit() {
    this.endpoint = this.configService.config.endpoint;
  }

  logOut() {
    this.editorService.logout(true);
  }

  backToMetabolights() {
    window.location.href = this.endpoint;
  }

  redirectToConsole() {
    this.router.navigate(["/console"]);
  }
}

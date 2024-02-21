import { Component, OnInit } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";

@Component({
  selector: "mtbls-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
 @select((state) => state.status.user) studyUser;
 @select((state) => state.status.bannerMessage) bannerMessage;
 @select((state) => state.status.maintenanceMode) maintenanceMode;

  authUser: any = null;
  query = "";
  metabolightsWebsiteUrl: string;
  metabolightsHeaderTitle: string;
  baseHref: string;
  banner: string = null;
  underMaintenance = false;
  constructor(private configService: ConfigurationService, private platformLocation: PlatformLocation) {
      this.setUpSubscription();
      const url = this.configService.config.endpoint;
      if(url.endsWith("/")){
        this.metabolightsWebsiteUrl = url.slice(0, -1);
      } else {
        this.metabolightsWebsiteUrl = url;
      }
      this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      if (this.platformLocation.hostname.startsWith("www.ebi")){
        this.metabolightsHeaderTitle = "MetaboLights";
      } else {
        if(this.platformLocation.port !== "" && this.platformLocation.port !== "80"){
          this.metabolightsHeaderTitle = this.platformLocation.hostname + ":"+ this.platformLocation.port;
        } else {
          this.metabolightsHeaderTitle = this.platformLocation.hostname;
        }

      }

  }

  setUpSubscription() {
    this.studyUser.subscribe((value) => {
      if (value != null) {
        this.authUser = value;
      }
    });
    this.maintenanceMode.subscribe((value) => {
      this.underMaintenance = value;
    });
    this.bannerMessage.subscribe((value) => {
        this.banner = value;
    });
  }

  sendQuery() {
    window.location.href = this.metabolightsWebsiteUrl + "/search?freeTextQuery=" + this.query;
  }
}

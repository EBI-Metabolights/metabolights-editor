import { Component, inject, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { Select, Store } from "@ngxs/store";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";

@Component({
  selector: "mtbls-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
  user$: Observable<Owner> = inject(Store).select(UserState.user);
  bannerMessage$: Observable<string> = inject(Store).select(ApplicationState.bannerMessage);
  maintenanceMode$: Observable<boolean> = inject(Store).select(ApplicationState.maintenanceMode);

  authUser: any = null;
  query = "";
  metabolightsWebsiteUrl: string;
  metabolightsHeaderTitle: string;
  baseHref: string;
  banner: string = null;
  underMaintenance = false;
  constructor(private configService: ConfigurationService, private platformLocation: PlatformLocation) {
      this.setUpSubscriptionsNgxs();
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


  setUpSubscriptionsNgxs() {
    this.user$.subscribe((value) => {
      if (value != null) {
        this.authUser = value;
      }
    });
    this.maintenanceMode$.subscribe((value) => {
      this.underMaintenance = value;
    });
    this.bannerMessage$.subscribe((value) => {
        this.banner = value;
    });

  }

  sendQuery() {
    window.location.href = this.metabolightsWebsiteUrl + "/search?freeTextQuery=" + this.query;
  }
}

import { PlatformLocation } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Environment } from "src/environment.interface";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  public baseHref: string;
  private configData: Environment | undefined;
  private configPath: string;

  constructor(private http: HttpClient,
    private platformLocation: PlatformLocation
    ) {
      this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      this.configPath = this.baseHref + "assets/configs/";
    }

  async loadConfiguration(): Promise<any> {
    try {
      const response = await this.http
        .get(`${this.configPath + environment.context + ".config.json"}`)
        .toPromise();
      this.configData = response as Environment;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  get config(): Environment | undefined {
    return this.configData;
  }
}

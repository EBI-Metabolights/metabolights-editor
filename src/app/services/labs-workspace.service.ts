import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigurationService } from "../configuration.service";

@Injectable({
  providedIn: "root",
})
export class LabsWorkspaceService {
  url: string = null;

  constructor(
    public http: HttpClient,
    private configService: ConfigurationService
  ) {
    this.url =
      this.configService.config.endpoint +
      this.configService.config.AuthenticationURL.initialise;
  }

  /**
   * Setting the type of the Observable to any is a temporary fix, we should asceertain the type of the response
   */
  initialise(payload: { jwt: string; user: string }) {
    return this.http.post<any>(this.url, payload);
  }
}

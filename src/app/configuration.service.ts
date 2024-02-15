import { PlatformLocation } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Environment } from "src/environment.interface";
import { environment } from "src/environments/environment";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  public baseHref: string;
  private configData: Environment | undefined;
  private configPath: string;
  private configLoadedSubject = new BehaviorSubject<boolean>(false)
  public configLoaded$ = this.configLoadedSubject.asObservable();

  constructor(private http: HttpClient,
    private platformLocation: PlatformLocation
    ) {
      console.log('constructor init')
      this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      this.configPath = this.baseHref + "assets/configs/";
    }

  async loadConfiguration(): Promise<any> {
    console.log('hit')
    try {
      const response = await this.http
        .get(`${this.configPath + "config.json"}`)
        .toPromise();
      this.configData = response as Environment;
      this.configLoadedSubject.next(true)
    } catch (err) {
      return Promise.reject(err);
    }
  }

  get config(): Environment | undefined {
    return this.configData;
  }
}

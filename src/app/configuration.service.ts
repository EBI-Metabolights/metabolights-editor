import { PlatformLocation } from "@angular/common";
import { HttpClient, HttpBackend } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EditorConfiguration, Environment } from "src/environment.interface";
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
  private http: HttpClient;

  constructor(private handler: HttpBackend,
    private platformLocation: PlatformLocation
    ) {
      this.http = new HttpClient(handler);
      this.baseHref = this.platformLocation.getBaseHrefFromDOM();
      this.configPath = this.baseHref + "assets/configs/";
    }

  async loadConfiguration(): Promise<any> {
    try {
      const response = await this.http
        .get(`${this.configPath + "config.json"}`)
        .toPromise();
      const baseConfig = response as Environment;
      let editorConfiguration = baseConfig.editorConfiguration;

      try {
        const runtimeResponse = await this.http
          .get(`${this.configPath + "editor-runtime.json"}`)
          .toPromise();
        editorConfiguration = this.mergeEditorConfiguration(
          editorConfiguration,
          runtimeResponse as EditorConfiguration
        );
      } catch (runtimeConfigError) {
        // Optional tracked editor configuration; continue with base config when absent.
      }

      this.configData = {
        ...baseConfig,
        ...(editorConfiguration ? { editorConfiguration } : {})
      };
      this.configLoadedSubject.next(true)
    } catch (err) {
      return Promise.reject(err);
    }
  }

  get config(): Environment | undefined {
    return this.configData;
  }

  private mergeEditorConfiguration(
    currentConfig?: EditorConfiguration,
    incomingConfig?: EditorConfiguration
  ): EditorConfiguration | undefined {
    if (!incomingConfig) {
      return currentConfig;
    }

    return {
      ...currentConfig,
      ...incomingConfig,
      upload: {
        ...(currentConfig?.upload || {}),
        ...(incomingConfig?.upload || {})
      }
    };
  }
}

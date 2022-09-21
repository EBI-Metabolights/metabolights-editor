import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from 'src/environment.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private configData: Environment | undefined;
  private readonly configPath: string = '/assets/configs/'; // environment.context or something ultimately

  constructor(private http: HttpClient) { }

  async loadConfiguration(): Promise<any> {
    try {
      const response = await this.http.get(`${this.configPath + environment.context + '.config.json'}`).toPromise();
      this.configData = response as Environment

    } catch(err) {
      return Promise.reject(err);
    }
  }

  get config(): Environment | undefined {
    return this.configData
  }
}

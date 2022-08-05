import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConfigurationService } from '../configuration.service';
import { AuthenticationURL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class LabsWorkspaceService {

  url: string = null

  constructor(public http: HttpClient, private configService: ConfigurationService) {
    this.url = this.configService.config.endpoint + this.configService.config.AuthenticationURL.initialise
   }

   /**
    * Setting the type of the Observable to any is a temporary fix, we should asceertain the type of the response
    */
  initialise(payload: {
    "jwt": string,
    "user": string
  }) {
    return this.http.post<any>(this.url, payload)
  }
}

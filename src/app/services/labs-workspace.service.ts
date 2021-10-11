import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { AuthenticationURL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class LabsWorkspaceService {

  url: string = AuthenticationURL['initialise']	

  constructor(public http: Http, public router: Router) {

   }

  initialise(payload: {
    "jwt": string,
    "user": string
  }) {
    return this.http.post(this.url, payload)
  }
}

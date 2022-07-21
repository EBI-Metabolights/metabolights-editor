import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationURL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class LabsWorkspaceService {

  url: string = AuthenticationURL['initialise']	

  constructor(public http: HttpClient) {

   }

  initialise(payload: {
    "jwt": string,
    "user": string
  }) {
    return this.http.post(this.url, payload)
  }
}

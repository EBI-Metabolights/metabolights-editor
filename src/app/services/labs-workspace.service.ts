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

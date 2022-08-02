import { Injectable } from '@angular/core';
import { httpOptions } from './../headers';
import { AuthenticationURL } from './../globals';
import { Router } from '@angular/router';
import { catchError, map} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthService{
	constructor(public router: Router, public http: HttpClient) {
	}

	login(body): any {
		return this.http.post(environment.endpoint + environment.AuthenticationURL.login, body,
		{
			headers: httpOptions.headers,
			observe: 'response'
		}).pipe(map(res => res), catchError(err => throwError(err)));
	}

	logout(): void {
	}

	// API token based auth - Checks weather the token is valid or not
	authenticateToken(body): any {
		return this.http.post(environment.endpoint + environment.AuthenticationURL.token, body, httpOptions).pipe(map(res => res), catchError(err => throwError(err)));
	}

	// Validate JWT token and responds back with a valid user
	getValidatedJWTUser(response): any {
		return this.http.post(
			environment.endpoint + environment.AuthenticationURL.initialise,
			 { "jwt" : response.headers.get("jwt"), "user" : response.headers.get("user")},
			  httpOptions
			  )
	}
}

import { Injectable } from '@angular/core';
import { httpOptions } from './../headers';
import { Router } from '@angular/router';
import { catchError, map} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from 'src/app/configuration.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService{
	constructor(public router: Router, public http: HttpClient, private configService: ConfigurationService) {
	}

	login(body): any {
		return this.http.post(
			this.configService.config.endpoint + this.configService.config.AuthenticationURL.login
			, body,
		{
			headers: httpOptions.headers,
			observe: 'response'
		}).pipe(map(res => res), catchError(err => throwError(err)));
	}

	logout(): void {
	}

	// API token based auth - Checks weather the token is valid or not
	authenticateToken(body): any {
		return this.http.post(
			this.configService.config.endpoint + this.configService.config.AuthenticationURL.token
			, body,  {observe: 'response' as 'body'}).pipe(map(res => res), catchError(err => throwError(err)));
	}

	// Validate JWT token and responds back with a valid user
	getValidatedJWTUser(response): any {
		return this.http.post(
			this.configService.config.endpoint + this.configService.config.AuthenticationURL.initialise,
			 { "jwt" : response.headers.get("jwt"), "user" : response.headers.get("user")},
			  httpOptions
			  )
	}
}

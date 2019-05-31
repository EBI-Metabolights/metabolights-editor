import { Injectable } from '@angular/core';
import { contentHeaders } from './../headers';
import { AuthenticationURL } from './../globals';
import { Router } from '@angular/router';
import { Http, Response, Headers } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './../../store';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService{
	constructor(public router: Router, public http: Http) {
	}

	login(body): any {
		return this.http.post(AuthenticationURL['login'], body, { headers: contentHeaders }).pipe(map(res => res), catchError(err => throwError(err)));
	}

	logout(): void {
	}

	// API token based auth - Checks weather the token is valid or not
	authenticateToken(body): any {
		return this.http.post(AuthenticationURL['token'], body, { headers: contentHeaders }).pipe(map(res => res), catchError(err => throwError(err)));
	}

	// Validate JWT token and responds back with a valid user
	getValidatedJWTUser(response): any {
		return this.http.post(AuthenticationURL['initialise'], { "jwt" : response.headers.get("jwt"), "user" : response.headers.get("user")}, { headers: contentHeaders }).pipe( map( response => response.json()))
	}
}
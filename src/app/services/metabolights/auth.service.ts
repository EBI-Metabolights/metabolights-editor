import { Injectable } from "@angular/core";
import { httpOptions, MtblsJwtPayload } from "./../headers";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "src/app/configuration.service";
import jwtDecode from "jwt-decode";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    public router: Router,
    public http: HttpClient,
    private configService: ConfigurationService
  ) {}

  login(body): any {
    return this.http
      .post(
        this.configService.config.metabolightsWSURL.baseURL +
          this.configService.config.authenticationURL.login,
        body,
        {
          headers: httpOptions.headers,
          observe: "response",
        }
      )
      .pipe(
        map((res) => res),
        catchError((err) => throwError(err))
      );
  }

  logout(): void {}

  // API token based auth - Checks weather the token is valid or not
  authenticateToken(body): any {
    return this.http
      .post(
        this.configService.config.metabolightsWSURL.baseURL +
          this.configService.config.authenticationURL.token,
        body,
        { observe: "response" as "body" }
      )
      .pipe(
        map((res) => res),
        catchError((err) => throwError(err))
      );
  }

  // Validate JWT token and responds back with a valid user
  getValidatedJWTUser(response): any {
    if (response.headers.get("jwt") !== null){
      return this.getAuthenticatedUser(response.headers.get("jwt"), response.headers.get("user"));
    }
  }

  getAuthenticatedUser(jwtToken: string, userName: string): any {
    const body = { jwt: jwtToken, user: userName };
    return this.http.post(
      this.configService.config.metabolightsWSURL.baseURL +
        this.configService.config.authenticationURL.initialise,
        body, httpOptions
    ).
    pipe(
      map((res) => res),
      catchError((err) => throwError(err))
    );
  }
}

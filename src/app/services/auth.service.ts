import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthTokens } from '../models/mtbl/mtbls/auth.model';
import { ConfigurationService } from '../configuration.service';
import init from 'multicast-dns';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private accessTokenKey = null;
  private refreshTokenKey = null;
  private apiTokenKey = null;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasTokens());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private refreshTokenUrl = null;
  private loginUrl = null;
  private logoutUrl = null;
  private initiated = false;
  constructor(
    private http: HttpClient,
    private configService: ConfigurationService,
    private readonly keycloak: KeycloakService
  ) {
    configService.configLoaded$.subscribe((value) => {
      if (value) {
        // this.accessTokenKey = this.configService.config.endpoint + "/jwt"
        this.accessTokenKey = "jwt"
        this.refreshTokenKey = this.configService.config.endpoint + "/refreshToken"
        this.apiTokenKey = this.configService.config.endpoint + "/apiToken"
        const rootUrl = this.configService.config
        this.loginUrl = rootUrl.metabolightsWSURL.baseURL + "/auth/login";
        this.loginUrl = rootUrl.metabolightsWSURL.baseURL + "/auth/logout";
        this.refreshTokenUrl = rootUrl.metabolightsWSURL.baseURL + "/auth/refresh-token";
        this.initiated = true;
      }
    });
  }

  login(username: string, password: string): Observable<AuthTokens> {
    if (this.initiated) {
      return this.http.post<AuthTokens>(this.loginUrl, {
        email: username,
        secret: password
      }).pipe(
        tap(tokens => this.storeTokens(tokens))
      );
    }
    return null;
  }

  refreshToken(): Observable<AuthTokens> {
    if (this.initiated) {
      const refresh_token = this.getRefreshToken();

      return this.http.post<AuthTokens>(this.refreshTokenUrl, {
        jwt: refresh_token
      }).pipe(
        tap(tokens => this.storeTokens(tokens))
      );
    }
    return null;
  }

  logout(): void {
    if (this.initiated) {
      const refresh_token = this.getRefreshToken();

      this.http.post(this.logoutUrl, { refresh_token }).subscribe({
        next: () => { },
        error: () => { }
      });

      this.clearTokens();
      this.isLoggedInSubject.next(false);
    }
  }

  // ───────────────────────────────────────────────
  // TOKEN MANAGEMENT
  // ───────────────────────────────────────────────
  storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.accessTokenKey, tokens.access_token);
    localStorage.setItem(this.refreshTokenKey, tokens.refresh_token);
    this.isLoggedInSubject.next(true);
  }

  storeApiToken(apiToken: string): void {
    localStorage.setItem(this.apiTokenKey, apiToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.apiTokenKey);
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getApiToken(): string | null {
    return localStorage.getItem(this.apiTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }
}
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

  private accessTokenKey = "jwt";
  private apiTokenKey = null;
  private isCuratorKey = null;
  private userKey = null;
  private usernameKey = null;
  private jwtExpirationTimeKey = null;

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
        this.accessTokenKey = "jwt"

        const endpoint = this.configService.config.endpoint.replace(/\/$/, '');
        this.apiTokenKey = endpoint + "/apiToken"
        this.isCuratorKey = endpoint + "/isCurator"
        this.userKey = endpoint + "/user"
        this.usernameKey = endpoint + "/username"
        this.jwtExpirationTimeKey = endpoint + "/jwtExpirationTime"

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
    // With Keycloak, token refresh is handled internally by KeycloakService
    return null;
  }

  logout(): void {
    if (this.initiated) {
      this.clearTokens();
      this.isLoggedInSubject.next(false);
    }
  }

  // ───────────────────────────────────────────────
  // TOKEN MANAGEMENT
  // ───────────────────────────────────────────────
  storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.accessTokenKey, tokens.access_token);
    this.isLoggedInSubject.next(true);
  }

  storeUserLocalStorage(data: {
    apiToken?: string;
    isCurator?: boolean;
    user?: string;
    username?: string;
    jwtExpirationTime?: number;
  }): void {
    this.configService.configLoaded$.subscribe((loaded) => {
      if (loaded) {
        if (data.apiToken) localStorage.setItem(this.apiTokenKey, data.apiToken);
        if (data.isCurator !== undefined) localStorage.setItem(this.isCuratorKey, data.isCurator.toString());
        if (data.user) localStorage.setItem(this.userKey, data.user);
        if (data.username) localStorage.setItem(this.usernameKey, data.username);
        if (data.jwtExpirationTime) localStorage.setItem(this.jwtExpirationTimeKey, data.jwtExpirationTime.toString());
      }
    });
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    this.configService.configLoaded$.subscribe((loaded) => {
      if (loaded) {
        // Clean up old refreshToken if it exists
        const endpoint = this.configService.config.endpoint.replace(/\/$/, '');
        localStorage.removeItem(endpoint + "/refreshToken");
        localStorage.removeItem(this.apiTokenKey);
        localStorage.removeItem(this.isCuratorKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.usernameKey);
        localStorage.removeItem(this.jwtExpirationTimeKey);
      }
    });
  }

  clearApiToken(): void {
    this.configService.configLoaded$.subscribe((loaded) => {
      if (loaded) {
        localStorage.removeItem(this.apiTokenKey);
      }
    });
  }

  hasTokens(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getApiToken(): string | null {
    return localStorage.getItem(this.apiTokenKey);
  }

  getRefreshToken(): string | null {
    return null;
  }
}
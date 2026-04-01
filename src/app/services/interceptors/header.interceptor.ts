import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import { ConfigurationService } from 'src/app/configuration.service';
import { ActivatedRoute } from '@angular/router';


@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService,
    private configService: ConfigurationService,
    private activatedRoute: ActivatedRoute
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const endpointWs = this.configService?.config?.metabolightsWSURL.baseURL;
    const origin = this.configService.config?.origin;
    const endpointWs3 = this.configService?.config?.ws3URL;

    // Normalize the URL to be absolute for comparison
    const fullUrl = req.url.startsWith('http') ? req.url : origin + req.url;

    let modifiedReq = req;
    const isMtblsWs = endpointWs && fullUrl.startsWith(endpointWs);
    const isMtblsWs3 = endpointWs3 && fullUrl.startsWith(endpointWs3);

    if (isMtblsWs || isMtblsWs3) {
      const accessToken = this.auth.getAccessToken();
      const userToken = this.auth.getApiToken();
      const isPublic = fullUrl.includes('/public/');
      let headers: any = {};

      if (accessToken && !isPublic) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const reviewCode = this.activatedRoute.snapshot.queryParams["reviewCode"];
      if (reviewCode) {
        headers["Obfuscation-Code"] = reviewCode;
      }

      if (userToken !== null && userToken.length > 0 && !isPublic) {
        headers["User-Token"] = userToken;
      }

      if (Object.keys(headers).length > 0) {
        modifiedReq = req.clone({
          setHeaders: headers
        });
      }

      if (accessToken) {
        return next.handle(modifiedReq).pipe(
          catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(modifiedReq, next);
            }
            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(modifiedReq);
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // reset

      return this.auth.refreshToken().pipe(
        switchMap((tokens: any) => {
          this.isRefreshing = false;

          this.auth.storeTokens(tokens);
          this.refreshTokenSubject.next(tokens.access_token);

          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokens.access_token}`
            }
          });

          return next.handle(newReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.auth.logout(); // optional
          return throwError(() => err);
        })
      );
    }

    // Wait until refresh completes, then retry failed request
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(newReq);
      })
    );
  }
}

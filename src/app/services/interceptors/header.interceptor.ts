import { inject, Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { disambiguateUserObj } from "../editor.service";
import { ConfigurationService } from "src/app/configuration.service";
import { Store } from "@ngxs/store";
import { StudyPermission } from "../headers";
import { ActivatedRoute} from '@angular/router';

/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  studyPermission: StudyPermission = null;
  constructor(
    private configService: ConfigurationService,
    private activatedRoute: ActivatedRoute,
    private store: Store
  ) {
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const endpoint = this.configService?.config?.endpoint;
    const origin = this.configService.config?.origin;
    const targetUrl = origin + request.url;

    const endpointWs3 = this.configService?.config?.ws3URL;
    if (request.url.startsWith(endpointWs3) || targetUrl.startsWith(endpointWs3)) {
      const jwt = localStorage.getItem("jwt");
        if (jwt !== null) {
          request = request.clone({
            setHeaders: {
              Authorization: "Bearer " + jwt,
            },
          });
        }
    }
    if (request.url.startsWith(endpoint) || targetUrl.startsWith(endpoint)) {
      const reviewCode = this.activatedRoute.snapshot.queryParams["reviewCode"];
      if ( reviewCode ) {

          request = request.clone({
            setHeaders: {
              "Obfuscation-Code": reviewCode,
            },
          });
      } else
      {
        let userToken = localStorage.getItem("userToken");
        const user = this.getUserObject();
        if (userToken === null) {
          if (user !== null) {
            userToken = disambiguateUserObj(this.getUserObject());
            localStorage.setItem("userToken", userToken);
          }
        }
        if (userToken !== null) {
          request = request.clone({
            setHeaders: {
              "user-token": userToken,
            },
          });
        } else {
          request = request.clone({
            setHeaders: {
              "user-token": "",
            },
          });
        }
        const jwt = localStorage.getItem("jwt");
        if (jwt !== null) {
          request = request.clone({
            setHeaders: {
              Authorization: "Bearer " + jwt,
            },
          });
        }
      }

    }
    return next.handle(request);
  }

  getUserObject() {
    const user = localStorage.getItem("user");
    if (user !== null) return JSON.parse(user);
    return null;
  }
}

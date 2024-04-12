import { Injectable } from "@angular/core";
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
import { environment } from "src/environments/environment";
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(
    private configService: ConfigurationService,
    private store: Store) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const endpoint = this.configService?.config?.endpoint;
    const origin = this.configService.config?.origin;
    const targetUrl = origin + request.url ;
    if (request.url.startsWith(endpoint) || targetUrl.startsWith(endpoint)){
      let userToken = localStorage.getItem("userToken");
    if(userToken === null) {
      const user = localStorage.getItem("user");
      if ( user !== null) {
        userToken = disambiguateUserObj(this.getUserObj());
        localStorage.setItem("userToken", userToken);
      }
    }
    if (userToken !== null){
      request = request.clone({
        setHeaders: {
          user_token: userToken,
        },
      });
    }else {
      request = request.clone({
        setHeaders: {
          user_token: "",
        },
      });
    }
    const jwt = localStorage.getItem("jwt");
    if (jwt !== null) {
      request = request.clone({
        setHeaders: {
          Authorization: "Bearer " + jwt
        },
      });
    }
    let permissions =  null
    permissions = this.store.snapshot().application.studyPermission

    if (permissions && permissions.obfuscationCode && permissions.studyStatus.toUpperCase() === "INREVIEW"){
        const user = this.store.snapshot().user.user;
        if (user === null || (user !== null && user.userName === permissions.userName)) {
          request = request.clone({
            setHeaders: {
              obfuscation_code: permissions.obfuscationCode
            }
          });
        }
    }
    }
    return next.handle(request);
  }

  getUserObj() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { disambiguateUserObj } from "../editor.service";
import { NgRedux } from "@angular-redux/store";
import { IAppState } from "src/app/store";
import { ConfigurationService } from "src/app/configuration.service";
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private ngRedux: NgRedux<IAppState>, private configService: ConfigurationService,) {}

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
    const permissions = this.ngRedux.getState().status.studyPermission;

    if (permissions && permissions.obfuscationCode && permissions.studyStatus.toUpperCase() === "INREVIEW"){
        const user = this.ngRedux.getState().status.user;
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

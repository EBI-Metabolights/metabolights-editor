import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { disambiguateUserObj } from "../editor.service";
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    console.log(request.headers)
    if (request.headers.has("user_token")) {
      console.log('hit first if')
      if (request.headers.get("user_token") === "dummy") {
        console.log('hit second if')
        if (localStorage.getItem("user") !== null) {
          request = request.clone({
            setHeaders: {
              /*user_token: disambiguateUserObj(this.getUserObj()),*/
              user_token: '6996ca30-672c-4cda-9a0e-d113d640776f'
            },
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

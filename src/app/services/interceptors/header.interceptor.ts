import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { disambiguateUserObj } from '../editor.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.headers.has('user_token')) {
      if(request.headers.get('user_token') === 'dummy'){
        if(localStorage.getItem('user') !== null) {
          console.log(disambiguateUserObj(localStorage.getItem('user')))
          request = request.clone({
            setHeaders: {
              'user_token': disambiguateUserObj(this.getUserObj())}
            })
        }

      }
    }
    return next.handle(request);
  }

  getUserObj() {
    return JSON.parse(localStorage.getItem('user'))
  }



}

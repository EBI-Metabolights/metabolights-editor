import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FactorInterceptor implements HttpInterceptor {

  constructor() {}

  /**Only intercept the response if the request was to the /factors endpoint */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (request.url.includes('factors') && (request.method === 'PUT' || request.method === 'POST')) {
            if (event.body && typeof event.body === 'object' && 'factor' in event.body) {
              let modifiedBody = this.convertBodyToArray(event.body);
              modifiedBody = this.removeSingularField(event.body);
              const clonedResponse = event.clone({body: modifiedBody});
              return clonedResponse
            }
          }
        }
      })
    );
  }

  /**
   * If we query the design descriptor endpoint with a value in the annotationValue query parameter, the API returns a single object,
   * not in a list, which is annoying to handle, as the field in the response body is also singular IE:
   *     studyDesignDescriptor: {...} vs studyDesignDescriptors[{...}, {...}]
   * So we use this interceptor to convert the first case into a list, and change the field name to the plural studyDesignDesriptors.
   */
  private convertBodyToArray(body: any) {
      const factorsArray = {factors: [body]}
      return {...body, }
  }

  private removeSingularField(body: any) {
      const { factor, ...restOfBody } = body
      return restOfBody
  }


}

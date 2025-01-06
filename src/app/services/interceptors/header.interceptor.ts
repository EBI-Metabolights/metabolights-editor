import { inject, Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";
import { disambiguateUserObj } from "../editor.service";
import { ConfigurationService } from "src/app/configuration.service";
import { Store } from "@ngxs/store";
import { environment } from "src/environments/environment";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { StudyPermission } from "../headers";
/* eslint-disable @typescript-eslint/naming-convention */
@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  studyPermission$: Observable<StudyPermission> = inject(Store).select(ApplicationState.studyPermission);

  studyPermission:StudyPermission = null;
  constructor(
    private configService: ConfigurationService,
    private store: Store) {
      this.ngOnInit()
    }

  ngOnInit() {
      this.studyPermission$.subscribe((value) => {
        this.studyPermission = value;
      });
    }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const endpoint = this.configService?.config?.endpoint;
    const origin = this.configService.config?.origin;
    const targetUrl = origin + request.url ;
    if (request.url.startsWith(endpoint) || targetUrl.startsWith(endpoint)){
      let userToken = localStorage.getItem("userToken");
    const user = this.getUserObject()
    if(userToken === null) {
      if ( user !== null) {
        userToken = disambiguateUserObj(this.getUserObject());
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
    const permissions = this.studyPermission;
    if (permissions && permissions.obfuscationCode && ["INREVIEW", "INCURATION"].includes(permissions.studyStatus.toUpperCase())){
      if (permissions.userName === null || permissions.userName.length == 0) {
        request = request.clone({
          setHeaders: {
            "Obfuscation-Code": permissions.obfuscationCode
          }
        });
      }
    }
    }
    return next.handle(request);
  }

  getUserObject() {
    const user = localStorage.getItem("user");
    if (user !== null)
      return JSON.parse(user);
    return null
  }
}

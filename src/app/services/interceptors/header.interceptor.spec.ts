import { NgReduxModule } from "@angular-redux/store";
import { NgReduxTestingModule } from "@angular-redux/store/testing";
import { ConfigurableFocusTrap } from "@angular/cdk/a11y";
import { HttpClient, HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { ConfigurationService } from "src/app/configuration.service";
import { toEditorSettings } from "typescript";
import { EditorService } from "../editor.service";
import { MetabolightsService } from "../metabolights/metabolights.service";
import { MockMetabolightsService } from "../metabolights/metabolights.service.mock";

import { HeaderInterceptor } from "./header.interceptor";
/* eslint-disable @typescript-eslint/naming-convention */
describe("HeaderInterceptor", () => {
  let metabolightsService: MetabolightsService;
  let configurationService: ConfigurationService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgReduxTestingModule, NgReduxModule],
      providers: [
        MetabolightsService,
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HeaderInterceptor,
          multi: true,
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configurationService = TestBed.inject(ConfigurationService);
    configurationService.loadConfiguration();
    metabolightsService = TestBed.inject(MetabolightsService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should do nothing if the user-token header already contains a non placeholder value", () => {
    http
      .get("https://www.ebi.ac.uk/metabolights/ws/", {
        headers: { user_token: "proper_token" },
      })
      .subscribe((res) => {
        expect(res).toBeTruthy();
      });

    const httpRequest = httpMock.expectOne(
      "https://www.ebi.ac.uk/metabolights/ws/"
    );
    expect(httpRequest.request.headers.get("user_token")).toEqual(
      "proper_token"
    );
  });

  it("should overwrite the user-token if there is a placeholder value", () => {
    spyOn(localStorage, "getItem").and.returnValue('{"apiToken":"testing"}');
    metabolightsService.getTitle("title").subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const httpRequest = httpMock.expectOne(
      "https://www.ebi.ac.uk/metabolights/ws/studies/title/title"
    );
    expect(httpRequest.request.headers.get("user_token")).toEqual("testing");
    expect(localStorage.getItem).toHaveBeenCalled();
  });
});

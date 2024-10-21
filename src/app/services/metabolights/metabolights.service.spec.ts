import { TestBed, inject } from "@angular/core/testing";
import {  Store } from "@ngxs/store";


import { MetabolightsService } from "./metabolights.service";
import { ConfigurationService } from "src/app/configuration.service";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("MetabolightsService", () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: MetabolightsService;
  let configService: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        MetabolightsService,
        {
            provide: ConfigurationService,
            useClass: MockConfigurationService,
        },
        Store,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["post"]);
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    service = new MetabolightsService(httpClientSpy as any, configService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

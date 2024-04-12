import { TestBed, inject } from "@angular/core/testing";
import {  Store } from "@ngxs/store";


import { MetabolightsService } from "./metabolights.service";
import { ConfigurationService } from "src/app/configuration.service";
import { MockConfigurationService } from "src/app/configuration.mock.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MetabolightsService", () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: MetabolightsService;
  let configService: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetabolightsService,
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
        Store
      ],
      imports: [HttpClientTestingModule],
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

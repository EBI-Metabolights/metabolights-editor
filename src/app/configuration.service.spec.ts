import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { ConfigurationService } from "./configuration.service";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("ConfigurationService", () => {
  let service: ConfigurationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ConfigurationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should make a http call to retrieve the config file, and that file should correspond to the environment context", () => {
    service.loadConfiguration();
    const httpRequest = httpMock.expectOne(
      "/metabolights/editor/assets/configs/test.config.json"
    );
  });
});

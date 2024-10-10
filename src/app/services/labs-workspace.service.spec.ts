import { HttpClient, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { MockConfigurationService } from "../configuration.mock.service";
import { ConfigurationService } from "../configuration.service";

import { LabsWorkspaceService } from "./labs-workspace.service";

describe("LabsWorkspaceService", () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: LabsWorkspaceService;
  let configService: ConfigurationService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        LabsWorkspaceService,
        {
            provide: ConfigurationService,
            useClass: MockConfigurationService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    configService = TestBed.inject(ConfigurationService);
    configService.loadConfiguration();
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["post"]);
    service = new LabsWorkspaceService(httpClientSpy as any, configService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

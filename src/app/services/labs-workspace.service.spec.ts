import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
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
      imports: [HttpClientTestingModule],
      providers: [
        LabsWorkspaceService,
        {
          provide: ConfigurationService,
          useClass: MockConfigurationService,
        },
      ],
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

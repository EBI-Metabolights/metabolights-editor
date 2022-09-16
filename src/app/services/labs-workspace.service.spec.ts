import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { ConfigurationService } from '../configuration.service';

import { LabsWorkspaceService } from './labs-workspace.service';

describe('LabsWorkspaceService', () => {
  let httpClientSpy: { get: jasmine.Spy };
  let service: LabsWorkspaceService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

 

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule]
    })
    let configService = new ConfigurationService(httpClientSpy as any)
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new LabsWorkspaceService(httpClientSpy as any, configService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

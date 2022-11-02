import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockConfigurationService } from '../configuration.mock.service';
import { ConfigurationService } from '../configuration.service';

import { FtpManagementService } from './ftp-management.service';

describe('FtpManagementService', () => {
  let service: FtpManagementService;
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FtpManagementService, {provide: ConfigurationService, useClass: MockConfigurationService}]
    });
    service = TestBed.inject(FtpManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

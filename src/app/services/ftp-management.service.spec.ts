import { TestBed } from '@angular/core/testing';

import { FtpManagementService } from './ftp-management.service';

describe('FtpManagementService', () => {
  let service: FtpManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FtpManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

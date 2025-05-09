import { TestBed } from '@angular/core/testing';

import { TransferHealthcheckService } from './transfer-healthcheck.service';

describe('TransferHealthcheckService', () => {
  let service: TransferHealthcheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferHealthcheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

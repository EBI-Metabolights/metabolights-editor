import { TestBed } from '@angular/core/testing';

import { MafService } from './maf.service';

describe('MafService', () => {
  let service: MafService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MafService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

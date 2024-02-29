import { TestBed } from '@angular/core/testing';

import { BaseConfigDependentService } from './base-config-dependent.service';

describe('BaseConfigDependentService', () => {
  let service: BaseConfigDependentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseConfigDependentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

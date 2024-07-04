import { TestBed } from '@angular/core/testing';

import { DescriptorsModalsService } from './descriptors-modals.service';

describe('DescriptorsModalsService', () => {
  let service: DescriptorsModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescriptorsModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

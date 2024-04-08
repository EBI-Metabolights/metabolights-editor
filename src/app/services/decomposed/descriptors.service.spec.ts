import { TestBed } from '@angular/core/testing';

import { DescriptorsService } from './descriptors.service';

describe('DescriptorsService', () => {
  let service: DescriptorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescriptorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

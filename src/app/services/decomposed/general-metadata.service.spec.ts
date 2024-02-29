import { TestBed } from '@angular/core/testing';

import { GeneralMetadataService } from './general-metadata.service';

describe('GeneralMetadataService', () => {
  let service: GeneralMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

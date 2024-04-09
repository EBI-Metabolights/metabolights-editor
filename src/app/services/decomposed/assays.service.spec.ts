import { TestBed } from '@angular/core/testing';

import { AssaysService } from './assays.service';

describe('AssaysService', () => {
  let service: AssaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

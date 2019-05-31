import { TestBed, inject } from '@angular/core/testing';

import { MetabolightsService } from './metabolights.service';

describe('MetabolightsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetabolightsService]
    });
  });

  it('should be created', inject([MetabolightsService], (service: MetabolightsService) => {
    expect(service).toBeTruthy();
  }));
});

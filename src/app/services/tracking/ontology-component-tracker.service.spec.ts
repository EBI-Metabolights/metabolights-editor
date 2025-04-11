import { TestBed } from '@angular/core/testing';

import { OntologyComponentTrackerService } from './ontology-component-tracker.service';

describe('OntologyComponentTrackerService', () => {
  let service: OntologyComponentTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OntologyComponentTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

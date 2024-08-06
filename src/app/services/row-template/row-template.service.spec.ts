import { TestBed } from '@angular/core/testing';

import { RowTemplateService } from './row-template.service';

describe('RowTemplateService', () => {
  let service: RowTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RowTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

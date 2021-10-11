import { TestBed } from '@angular/core/testing';

import { LabsWorkspaceService } from './labs-workspace.service';

describe('LabsWorkspaceService', () => {
  let service: LabsWorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabsWorkspaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

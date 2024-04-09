import { TestBed } from '@angular/core/testing';

import { FactorInterceptor } from './factor.interceptor';

describe('FactorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      FactorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: FactorInterceptor = TestBed.inject(FactorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

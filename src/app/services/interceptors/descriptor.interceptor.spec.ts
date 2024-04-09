import { TestBed } from '@angular/core/testing';

import { DescriptorInterceptor } from './descriptor.interceptor';

describe('DescriptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DescriptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: DescriptorInterceptor = TestBed.inject(DescriptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

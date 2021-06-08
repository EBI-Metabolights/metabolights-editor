import { ElementRef } from '@angular/core';
import { LazyLoadImagesDirective } from './lazy-load-images.directive';

export class MockElementRef extends ElementRef {
  nativeElement = {};
}

describe('LazyLoadImagesDirective', () => {
  it('should create an instance', () => {
    let mock = new MockElementRef({});
    const directive = new LazyLoadImagesDirective(mock);
    expect(directive).toBeTruthy();
  });
});

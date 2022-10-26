import { ElementRef } from '@angular/core';
import { LazyLoadImagesDirective } from './lazy-load-images.directive';

export class MockElementRef extends ElementRef {}

describe('LazyLoadImagesDirective', () => {
  it('should create an instance', () => {
    const directive = new LazyLoadImagesDirective(new MockElementRef({}));
    expect(directive).toBeTruthy();
  });
});

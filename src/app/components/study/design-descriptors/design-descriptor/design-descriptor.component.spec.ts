import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignDescriptorComponent } from './design-descriptor.component';

describe('DesignDescriptorComponent', () => {
  let component: DesignDescriptorComponent;
  let fixture: ComponentFixture<DesignDescriptorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignDescriptorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignDescriptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

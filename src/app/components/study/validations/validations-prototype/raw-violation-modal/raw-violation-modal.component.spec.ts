import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RawViolationModalComponent } from './raw-violation-modal.component';

describe('RawViolationModalComponent', () => {
  let component: RawViolationModalComponent;
  let fixture: ComponentFixture<RawViolationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RawViolationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawViolationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationsV2ParentComponent } from './validations-v2-parent.component';

describe('ValidationsPrototypeComponent', () => {
  let component: ValidationsV2ParentComponent;
  let fixture: ComponentFixture<ValidationsV2ParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationsV2ParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationsV2ParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

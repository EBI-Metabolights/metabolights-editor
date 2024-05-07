import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationsPrototypeComponent } from './validations-prototype.component';

describe('ValidationsPrototypeComponent', () => {
  let component: ValidationsPrototypeComponent;
  let fixture: ComponentFixture<ValidationsPrototypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationsPrototypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationsPrototypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

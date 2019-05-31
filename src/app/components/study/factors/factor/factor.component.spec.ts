import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorComponent } from './factor.component';

describe('FactorComponent', () => {
  let component: FactorComponent;
  let fixture: ComponentFixture<FactorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

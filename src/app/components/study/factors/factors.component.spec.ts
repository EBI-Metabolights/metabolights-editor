import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactorsComponent } from './factors.component';

describe('FactorsComponent', () => {
  let component: FactorsComponent;
  let fixture: ComponentFixture<FactorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeDetailComponent } from './prototype-detail.component';

describe('PrototypeDetailComponent', () => {
  let component: PrototypeDetailComponent;
  let fixture: ComponentFixture<PrototypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrototypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrototypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

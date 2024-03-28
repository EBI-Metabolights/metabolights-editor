import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeTableComponent } from './prototype-table.component';

describe('PrototypeTableComponent', () => {
  let component: PrototypeTableComponent;
  let fixture: ComponentFixture<PrototypeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrototypeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrototypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

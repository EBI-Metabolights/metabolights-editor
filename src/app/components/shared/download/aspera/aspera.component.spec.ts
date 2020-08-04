import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsperaComponent } from './aspera.component';

describe('AsperaComponent', () => {
  let component: AsperaComponent;
  let fixture: ComponentFixture<AsperaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsperaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsperaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidedAssaysComponent } from './assays.component';

describe('AssaysComponent', () => {
  let component: GuidedAssaysComponent;
  let fixture: ComponentFixture<GuidedAssaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidedAssaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidedAssaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

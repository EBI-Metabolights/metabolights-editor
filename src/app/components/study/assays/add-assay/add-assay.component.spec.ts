import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssayComponent } from './add-assay.component';

describe('AddAssayComponent', () => {
  let component: AddAssayComponent;
  let fixture: ComponentFixture<AddAssayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAssayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAssayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssayDetailsComponent } from './assay-details.component';

describe('AssayDetailsComponent', () => {
  let component: AssayDetailsComponent;
  let fixture: ComponentFixture<AssayDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssayDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

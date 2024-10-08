import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationInfoModalComponent } from './validation-info-modal.component';

describe('ValidationInfoModalComponent', () => {
  let component: ValidationInfoModalComponent;
  let fixture: ComponentFixture<ValidationInfoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationInfoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationSectionComponent } from './validation-section.component';

describe('ValidationSectionComponent', () => {
  let component: ValidationSectionComponent;
  let fixture: ComponentFixture<ValidationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

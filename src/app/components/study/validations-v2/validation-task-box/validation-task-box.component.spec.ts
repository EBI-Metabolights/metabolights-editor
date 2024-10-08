import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationTaskBoxComponent } from './validation-task-box.component';

describe('ValidationTaskBoxComponent', () => {
  let component: ValidationTaskBoxComponent;
  let fixture: ComponentFixture<ValidationTaskBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationTaskBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationTaskBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

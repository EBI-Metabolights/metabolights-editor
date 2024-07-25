import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationReportSummaryComponent } from './validation-report-summary.component';

describe('ValidationReportSummaryComponent', () => {
  let component: ValidationReportSummaryComponent;
  let fixture: ComponentFixture<ValidationReportSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationReportSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationReportSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

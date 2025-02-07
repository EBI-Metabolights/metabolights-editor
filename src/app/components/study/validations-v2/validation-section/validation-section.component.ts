import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ValidationReportSubsection, ViolationType } from '../interfaces/validation-report.types';
import { Violation } from '../interfaces/validation-report.interface';
import { filter, Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';

@Component({
  selector: 'app-validation-section',
  standalone: false,
  templateUrl: './validation-section.component.html',
  styleUrl: './validation-section.component.css'
})
export class ValidationSectionComponent implements OnInit, OnChanges {

  @Input() violations: Violation[];
  @Input() subsections: ValidationReportSubsection[];
  @Input() studyId: string;

  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);


  selectedSubsections: ValidationReportSubsection[] = [];
  filteredViolations: Violation[] = [];

  violationTypes = ["ERROR", "WARNING"];
  selectedViolationTypes = ["ERROR", "WARNING"];

  validationStatus: ViolationType = null;

  ngOnInit(): void {
    this.selectedSubsections = JSON.parse(JSON.stringify(this.subsections));
    this.filteredViolations = this.violations;
    this.validationStatus$.pipe(filter(val => val !== null)).subscribe((val) => {
      this.validationStatus = val;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filterViolations();
    
    if (changes.selectedSubsections || changes.selectedViolationTypes) {
      this.filterViolations();
    }
  }

  filterViolations() {
    this.filteredViolations = this.violations.filter(
      violation => this.subsectionSelected(violation.section) && this.selectedViolationTypes.includes(violation.type)
    )
  }


  getSelectedValues() {
  }

  subsectionSelected(section): boolean {
    return this.selectedSubsections.includes(removeBeforeFirstFullStop(section));
  }

  typeSelected(type): boolean {
    return this.selectedViolationTypes.includes(type);
  }

}

function removeBeforeFirstFullStop(input: ValidationReportSubsection): ValidationReportSubsection {
  const firstFullStopIndex = input.indexOf('.');
  if (firstFullStopIndex === -1) {
    return input; // No full stop found, return the original string
  }
  return input.substring(firstFullStopIndex + 1) as ValidationReportSubsection;
}


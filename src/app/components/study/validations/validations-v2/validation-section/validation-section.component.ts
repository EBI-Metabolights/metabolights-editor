import { Component, Input, OnInit } from '@angular/core';
import { ValidationReportSubsection } from '../interfaces/validation-report.types';
import { Violation } from '../interfaces/validation-report.interface';

@Component({
  selector: 'app-validation-section',
  standalone: false,
  templateUrl: './validation-section.component.html',
  styleUrl: './validation-section.component.css'
})
export class ValidationSectionComponent implements OnInit {

  @Input() violations: Violation[];
  @Input() subsections: ValidationReportSubsection[];
  selectedSubsections: ValidationReportSubsection[] = [];

  violationTypes = ["ERROR", "WARNING"];
  selectedViolationTypes = ["ERROR", "WARNING"];

  ngOnInit(): void {
    this.selectedSubsections = JSON.parse(JSON.stringify(this.subsections));
  }

  getSelectedValues() {
    console.log(this.selectedSubsections);
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


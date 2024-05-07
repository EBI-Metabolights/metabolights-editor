import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ValidationReportSection } from '../interfaces/validation-report.types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ValidationReportInterface } from '../interfaces/validation-report.interface';
import { FormControl, FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Store } from '@ngxs/store';
import { NewValidationReport } from 'src/app/ngxs-store/study/validation/validation.actions';


export interface  GraphItem {
  name: string;
  value: number;
  extra: Record<string, any>
}
export interface GraphSeries {

}

@Component({
  selector: 'app-validation-report-summary',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, FormsModule, MatButtonModule, MatButtonToggleModule, NgxChartsModule, BrowserAnimationsModule],
  templateUrl: './validation-report-summary.component.html',
  styleUrl: './validation-report-summary.component.css'
})
export class ValidationReportSummaryComponent implements OnInit{

  view: any[] = [500, 400];

  // options
  showLegend: boolean = true;
  showLabels: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };


  validationReportSections: ValidationReportSection[] = [
    "input",
    "investigation",
    "assay",
    "assignment",
    "sample",
    "files"
  ];


  violationsToggle: string = 'errorsGraphItems'

  @Input() report: ValidationReportInterface
  @Input() accession: string;

  private errors: Record<string, number> = {};
  private warnings: Record<string, number> = {};
  private both: Record<string, number> = {};

  public dataReady: boolean = false;

  errorsGraphItems: GraphItem[] = [];
  warningsGraphItems: GraphItem[] = [];
  bothGraphItems: GraphItem[] = [];
  current: GraphItem[] = [];

  constructor(private store: Store) {}

  ngOnInit(): void {
      this.breakReportIntoSections();
      this.convertToSwimlaneFormat();
      this.dataReady = true;

      
  }

  setGraphItems() {

  }

  getWs3Report() {
    this.store.dispatch(new NewValidationReport.Get(true));
  }

  breakReportIntoSections() {
    this.validationReportSections.forEach(section => {
      this.errors[`${section}`] = 0
      this.warnings[`${section}`] = 0
      this.both[`${section}`] = 0
    });

    for(let violation of this.report.violations) {
      const section = this.findStartingSection(violation.section);
      if (violation.type === 'WARNING') {
        this.warnings[section] += 1;
        this.both[section] += 1
      }
      if (violation.type === 'ERROR' ) {
        this.errors[section] += 1;
        this.both[section] += 1
      }

    }

  }

  convertToSwimlaneFormat() {
    this.addItems(this.errors, this.errorsGraphItems);
    this.addItems(this.warnings, this.warningsGraphItems);
    this.addItems(this.both, this.bothGraphItems);
    console.log(this.errors);
    console.log(this.errorsGraphItems);
  }

  addItems(source: any, target: any[]) {
    for (let thing in source) {
      if (source.hasOwnProperty(thing)) {
        //const item = source[thing];
        //const k = Object.keys(item)[0];
        //console.log(k)
        target.push({name: thing, value: source[thing], extra: {}});
      }
    }
  }

  findStartingSection(sectionString: string): ValidationReportSection | undefined {
    return this.validationReportSections.find(section => sectionString.startsWith(section))
  }

  onSelect($event) {
    console.log($event);
  }
}


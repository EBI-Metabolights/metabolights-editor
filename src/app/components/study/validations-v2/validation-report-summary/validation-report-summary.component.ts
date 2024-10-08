import { AfterViewInit, Component, inject, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ValidationReportSection, ViolationType } from '../interfaces/validation-report.types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatRadioModule} from '@angular/material/radio';
import { Store } from '@ngxs/store';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { Ws3ValidationReport } from '../interfaces/validation-report.interface';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { Observable } from 'rxjs';


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
  imports: [MatCardModule, MatDividerModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatRadioModule, NgxChartsModule, BrowserAnimationsModule],
  templateUrl: './validation-report-summary.component.html',
  styleUrl: './validation-report-summary.component.css'
})
export class ValidationReportSummaryComponent implements OnInit, AfterViewInit, OnChanges {

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

  @Input() report: Ws3ValidationReport
  @Input() accession: string;

  @ViewChild('chart', { static: false }) chart: any;

  taskId$: Observable<string> = inject(Store).select(ValidationState.taskId);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);
  lastValidationRunTime$: Observable<string> = inject(Store).select(ValidationState.lastValidationRunTime);


  private errors: Record<string, number> = {};
  private warnings: Record<string, number> = {};
  private both: Record<string, number> = {};

  public dataReady: boolean = false;
  public taskId: string = "dud";
  public validationStatus: ViolationType = null;
  public lastValidationRunTime: string =  "-";

  errorsGraphItems: GraphItem[] = [];
  warningsGraphItems: GraphItem[] = [];
  bothGraphItems: GraphItem[] = [];
  current: GraphItem[] = [];

  constructor(private store: Store, private renderer: Renderer2) {}

  ngOnInit(): void {
      this.taskId$.subscribe(value => {
        if (value !== null) this.taskId = value;
      });
      this.validationStatus$.subscribe(value => {
        if (value !== null) this.validationStatus = value
      });
      this.lastValidationRunTime$.subscribe(value => {
        if (value !== null) this.lastValidationRunTime = value
      })

      if (this.report !== null) {
        this.breakReportIntoSections();
        this.convertToSwimlaneFormat();
        this.dataReady = true;
      }

  }

  ngAfterViewInit(): void {
    if(this.report !== null) {
      this.addCustomListeners();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      if(this.report !== null) {
        this.breakReportIntoSections();
        this.convertToSwimlaneFormat();
        this.dataReady = true;
        this.addCustomListeners();
      }
    }
  }


  addCustomListeners() {
    // Wait for the microtask queue to be empty so the chart is fully rendered
    setTimeout(() => {
      console.log(this.chart);
      const elements = this.chart.chartElement.nativeElement.querySelectorAll('g.pie-grid-item');
      elements.forEach(element => {
        this.renderer.listen(element, 'click', (event) => {
          console.log('Pie arc clicked', event);
          // Implement your custom logic here
          //target.innerHTML
        });
      });
    });
  }

  setGraphItems() {

  }

  initNewTask() {
    this.store.dispatch(new ValidationReportV2.InitialiseValidationTask());
  }

  getWs3Report() {
    this.store.dispatch(new ValidationReportV2.Get());
  }

  getFakeWs3Report() {
    this.store.dispatch(new ValidationReportV2.Get(null, true));
  }

  breakReportIntoSections() {
    this.validationReportSections.forEach(section => {
      this.errors[`${section}`] = 0
      this.warnings[`${section}`] = 0
      this.both[`${section}`] = 0
    });

    for(let violation of this.report.messages.violations) {
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


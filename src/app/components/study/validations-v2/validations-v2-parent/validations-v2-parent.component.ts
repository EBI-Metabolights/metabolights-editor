import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, filter, Observable, withLatestFrom } from 'rxjs';
import { ValidationPhase, Violation, Ws3ValidationReport } from '../interfaces/validation-report.interface';
import { Store } from '@ngxs/store';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { validationReportFilesSubsectionList, validationReportAssaySubsectionList, validationReportAssignmentSubsectionList, validationReportInvestigationSubsectionList, validationReportSamplesSubsectionList, validationReportInputSubsectionList} from '../interfaces/validation-report.types';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';



@Component({
  selector: 'validations-v2-parent',
  templateUrl: './validations-v2-parent.component.html',
  styleUrls: ['./validations-v2-parent.component.css']
})
export class ValidationsV2ParentComponent implements OnInit {

  reportV2$: Observable<Ws3ValidationReport> = inject(Store).select(ValidationState.reportV2);
  allViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2ViolationsAll);

  history$: Observable<Array<ValidationPhase>> = inject(Store).select(ValidationState.history);
  initialLoadMade$: Observable<boolean> = inject(Store).select(ValidationState.initialLoadMade);

  generalViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('input'));
  investigationViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('investigation'));
  sampleViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('sample'));
  assayViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('assay'));
  assignmentViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('assignment'));
  filesViolations$: Observable<Violation[]> = inject(Store).select(ValidationState.reportV2Violations('files'));

  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);

  constructor(private store: Store) {
   }
  
  //report variables
  report: Ws3ValidationReport = null;
  history: Array<ValidationPhase> = [];
  selectedPhase: ValidationPhase = null;
  lastRunTime: string = ""

  // report subsections
  allViolations: Violation[] = [];
  generalViolations: Violation[] = [];
  investigationViolations: Violation[] = [];
  sampleViolations: Violation[] =  [];
  assayViolations: Violation[] = [];
  assignmentViolations: Violation[] = [];
  filesViolations: Violation[] = [];
  
  // core state variables
  studyId: string =  null
  isCurator: boolean = false;

  checked: boolean = false;
  ready: boolean = true;
  loadingDiffReport = false;

  // Subsection buckets
  investigationSubsections = validationReportInvestigationSubsectionList;
  samplesSubsections = validationReportSamplesSubsectionList;
  assaySubsections = validationReportAssaySubsectionList;
  assignmentSubsections = validationReportAssignmentSubsectionList;
  filesSubsections = validationReportFilesSubsectionList;
  generalSubsections = validationReportInputSubsectionList;

  ngOnInit(): void {



    this.isCurator$.subscribe(value => {
      this.isCurator = value;
      }
    )

    this.reportV2$.pipe(filter(val => val !== null)).subscribe(value => {
      this.report = value;
      if (this.report !== null) {
        if(this.loadingDiffReport) this.loadingDiffReport = false;
        this.ready = true;
      }
    });


    this.history$.subscribe(
      (history) => {
        if (history !== null) {
          this.history = history;
          this.selectedPhase = this.history[0]

          if (this.history.length === 0) {
            // TODO: this means a study has never been validated - we should account for this in the UI
          }
        }
      })

    this.allViolations$.subscribe((value) => {
      this.allViolations = value;
    });

    this.generalViolations$.subscribe((value) => {
      this.generalViolations = value;
    })

    this.investigationViolations$.subscribe((value) => {
      this.investigationViolations = value;
    });

    this.sampleViolations$.subscribe((value) => {
      this.sampleViolations = value;
    });

    this.assayViolations$.subscribe((value) => {
      this.assayViolations = value;
    });

    this.assignmentViolations$.subscribe((value) => {
      this.assignmentViolations = value;
    });

    this.filesViolations$.subscribe((value) => {
      this.filesViolations = value;
    });


    this.studyId$.pipe(filter(value => value !== null)).subscribe(value => {
      this.studyId = value;
      this.store.dispatch(new ValidationReportV2.Get(this.studyId));
      this.store.dispatch(new ValidationReportV2.History.Get(this.studyId))
    });
  }

  onPhaseSelection($event) {
    console.log($event)
    this.store.dispatch(new ValidationReportV2.Get(this.studyId, $event.taskId));
    this.loadingDiffReport = true;
    // TODO set up some kind of loading state
  }

  downloadReport() {
    const jsonStr = JSON.stringify(this.report, null, 2); // Pretty print with 2-space indentation
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.studyId}-report-${this.selectedPhase.taskId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }


}

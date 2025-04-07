import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, filter, Observable, withLatestFrom } from 'rxjs';
import { FullOverride, ValidationPhase, Violation, Ws3ValidationReport } from '../interfaces/validation-report.interface';
import { Store } from '@ngxs/store';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { validationReportFilesSubsectionList, validationReportAssaySubsectionList, validationReportAssignmentSubsectionList, validationReportInvestigationSubsectionList, validationReportSamplesSubsectionList, validationReportInputSubsectionList, ViolationType} from '../interfaces/validation-report.types';
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

  overrides$: Observable<FullOverride[]> = inject(Store).select(ValidationState.overrides);
  validationNeeded$: Observable<boolean> = inject(Store).select(ValidationState.validationNeeded);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);


  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);

  constructor(private store: Store) {
   }

  //report variables
  report: Ws3ValidationReport = null;
  history: Array<ValidationPhase> = [];
  selectedPhase: ValidationPhase = null;
  lastRunTime: string = "";
  validationNeeded: boolean = false;
  validationStatus: ViolationType = null;

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

  //override variables
  overrides: FullOverride[] = [];
  overrideListModalOpen = false;

  ngOnInit(): void {

    this.isCurator$.subscribe(value => {
      this.isCurator = false
      if (value !== null) {
        this.isCurator = value;
        this.updateValidationStatus();
      }}
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

    this.overrides$.pipe(filter(val => val !== null)).subscribe(value => {
      this.overrides = value;
    });

    this.validationNeeded$.pipe(filter(val => val !== null)).subscribe(value => {
      this.validationNeeded = value;
    });

    this.validationStatus$.pipe(filter(val => val !== null)).subscribe(value => {
      this.validationStatus = value;
    })
  }

  onPhaseSelection($event) {
    this.store.dispatch(new ValidationReportV2.Get(this.studyId, $event.taskId));
    this.loadingDiffReport = true;
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

  openOverrideListModal() {
    this.overrideListModalOpen = true;
  }

  overrideListModalClosed($event) {
    this.overrideListModalOpen = false;
  }

  handleDeleteOverride($event: string) {
    this.store.dispatch(new ValidationReportV2.Override.Delete(this.studyId, $event));
  }

  updateValidationStatus() {
    this.validationEnabled =  this.isCurator || (this.studyStatus && ["private", "provisional", "in review"].includes(this.studyStatus.toLowerCase()));
  }

}

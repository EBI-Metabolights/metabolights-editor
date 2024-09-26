import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {  ValidationPhase, Violation, Ws3ValidationReport } from '../interfaces/validation-report.interface';
import { Select, Store } from '@ngxs/store';
import { ValidationState } from 'src/app/ngxs-store/study/validation/validation.state';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { validationReportFilesSubsectionList, validationReportAssaySubsectionList, validationReportAssignmentSubsectionList, validationReportInvestigationSubsectionList, validationReportSamplesSubsectionList, validationReportInputSubsectionList} from '../interfaces/validation-report.types';
import { UserState } from 'src/app/ngxs-store/non-study/user/user.state';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { filter } from 'rxjs-compat/operator/filter';



@Component({
  selector: 'validations-v2-parent',
  templateUrl: './validations-v2-parent.component.html',
  styleUrls: ['./validations-v2-parent.component.css']
})
export class ValidationsV2ParentComponent implements OnInit {

  @Select(ValidationState.reportV2) reportV2$: Observable<Ws3ValidationReport>;
  @Select(ValidationState.reportV2ViolationsAll) allViolations$: Observable<Violation[]>;

  @Select(ValidationState.history) history$: Observable<Array<ValidationPhase>>
  @Select(ValidationState.initialLoadMade) initialLoadMade$: Observable<boolean>;

  @Select(ValidationState.reportV2Violations('input')) generalViolations$: Observable<Violation[]>;
  @Select(ValidationState.reportV2Violations('investigation')) investigationViolations$: Observable<Violation[]>;
  @Select(ValidationState.reportV2Violations('sample')) sampleViolations$: Observable<Violation[]>;
  @Select(ValidationState.reportV2Violations('assay')) assayViolations$: Observable<Violation[]>;
  @Select(ValidationState.reportV2Violations('assignment')) assignmentViolations$: Observable<Violation[]>;
  @Select(ValidationState.reportV2Violations('files')) filesViolations$: Observable<Violation[]>;

  @Select(GeneralMetadataState.id) studyId$: Observable<string>;
  @Select(UserState.isCurator) isCurator$: Observable<boolean>;

  constructor(private store: Store) {
    this.store.dispatch(new ValidationReportV2.Get());
    this.store.dispatch(new ValidationReportV2.History.Get())
   }

  report: Ws3ValidationReport = null;
  history: Array<ValidationPhase> = [];
  selectedPhase: ValidationPhase = null;
  lastRunTime: string = ""

  // report subsections
  allViolations: Violation[] = null;
  generalViolations: Violation[] = null;
  investigationViolations: Violation[] = null;
  sampleViolations: Violation[] =  null;
  assayViolations: Violation[] = null;
  assignmentViolations: Violation[] = null;
  filesViolations: Violation[] = null;

  studyId: string =  null

  isCurator: boolean = false;

  checked: boolean = false;
  ready: boolean = true;

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

    this.reportV2$.subscribe(value => {
      console.log(value === null)
      this.report = value;
      if (this.report !== null) {
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

    this.studyId$.subscribe(value => {
      this.studyId = value;
    });
  }

  onPhaseSelection($event) {
    console.log($event)
    this.store.dispatch(new ValidationReportV2.Get($event.taskId))
    // TODO set up some kind of loading state
  }


}

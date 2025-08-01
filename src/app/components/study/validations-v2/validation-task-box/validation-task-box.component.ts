import { Component, inject, OnInit } from '@angular/core';
import {Store } from '@ngxs/store';
import { interval, Observable } from 'rxjs';
import { filter, takeWhile, tap } from 'rxjs/operators';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { ValidationState, ValidationTask } from 'src/app/ngxs-store/study/validation/validation.state';
import { ViolationType } from '../interfaces/validation-report.types';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { GetGeneralMetadata } from 'src/app/ngxs-store/study/general-metadata/general-metadata.actions';
import { FtpManagementService } from 'src/app/services/ftp-management.service';
import { Ws3ValidationReport } from '../interfaces/validation-report.interface';


export const DescriptionMessages = {
  SUCCESS: {
    ERROR: "Study has failed validation pipeline.",
    WARNING: "Study has passed validation pipeline, with warnings. Please consult report.",
    SUCCESS: "Study has passed validation pipeline."
  },
  FAILED: "Unable to complete validation task. Please contact metabolights-help if the problem persists.",
  PENDING: "Validation task is awaiting execution in a queue.",
  INITIATED: "Task is executing.",
  REVOKED: "Validation task was revoked. If this was unexpected contact metabolights-help.",
  NONE: "-"
}


@Component({
  selector: 'app-validation-task-box',
  standalone: false,
  templateUrl: './validation-task-box.component.html',
  styleUrl: './validation-task-box.component.css'
})
export class ValidationTaskBoxComponent implements OnInit {

  currentTask$: Observable<ValidationTask> = inject(Store).select(ValidationState.currentValidationTask);
  validationStatus$: Observable<ViolationType> = inject(Store).select(ValidationState.validationStatus);
  lastValidationTime$: Observable<string> = inject(Store).select(ValidationState.lastValidationRunTime);
  studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  reportV2$: Observable<Ws3ValidationReport> = inject(Store).select(ValidationState.reportV2);

  buttonTexts = "Initiate Validation Task"
  startButtonClass = "";

  lastRunTime = "";
  status = ""

  showTaskId = false;
  serverReady = true;

  /** Validation task handling attributes */
  isInitiated = false;
  taskStarted = false;

  taskStates =  ['INITIATED', 'STARTED', 'SUCCESS', 'FAILURE', 'REVOKED', 'PENDING']
  dm = DescriptionMessages;
  dynamicStatus: keyof typeof DescriptionMessages.SUCCESS
  currentTaskState: ValidationTask = {id: "", ws3TaskStatus: "NONE"};

  studyId: string = "";

  showModal = false; // Flag to control modal visibility
  report: Ws3ValidationReport;
  modifiers: string[];
  
  constructor(private store: Store, private ftpService: FtpManagementService) {}


  ngOnInit(): void {

    
    this.currentTask$.subscribe((task) => {
      if (task !== null) {
        this.currentTaskState = task;
      }
    })

    this.validationStatus$.subscribe((status) => {
      if (status !== null) {
        this.status = status
      }
    });

    this.lastValidationTime$.subscribe((time) => {
      if (time !== null) {
        this.lastRunTime = time;
      }
    });

    this.studyId$.subscribe((id) => {
      if (id !== null) {
        this.studyId = id;
      }
    })

    this.reportV2$.pipe(filter(val => val !== null)).subscribe(value => {
      this.report = value;
      if (![undefined, null].includes(this.report.metadata_updates)) this.modifiers = this.report.metadata_updates;
      else this.modifiers = [];
    });
      
  }

  // we also need this to subscribe to validation task updates so that the user doesnt have to do it.
  startValidationTask() {
    const deposedTaskId = this.currentTaskState.id;

    this.store.dispatch(new ValidationReportV2.InitialiseValidationTask(false, this.studyId)).pipe( // currently proxying, this will not work outside of dev
      tap(() => {
        this.isInitiated = true
        
      })
    ).subscribe({
      next: (next) => {
        const taskSub = this.store.selectOnce(ValidationState.currentValidationTask)
        let newTask: ValidationTask | null = null

        /**
         * Below we are defining an observable, which emits every 1 seconds. We also modify this Observable using pipe,
         * and the operators takeWhile and tap. We use these operators to make the following modifications:
         *  takeWhile: automatically close the subscription once a task has completed, by checking whether the current task state is a termination state.
         *  tap: Add the side effect of assigning a value to newTask via selectOnce, if one hasn't been already. newTask.id is used in every subsequent 
         *    validation get action,  and the value that we receive has been previously set in the handler of InitialiseValidationTask.
         */
        const timer = interval(1000);
        const responseSubscription = timer.pipe(
          takeWhile(value => ["SUCCESS", "FAILURE", "ERROR"].includes(this.currentTaskState.ws3TaskStatus) === false /*&& this.currentTaskState.id === deposedTaskId*/),
          tap(() => {
            if (newTask === null) taskSub.subscribe(task => newTask = task)
          })
        )

        responseSubscription.subscribe({
          next: () => {
            this.taskStarted = true;
            this.store.dispatch(new ValidationReportV2.Get(this.studyId, newTask.id))},
          error: () => console.log('Unexpected error in Validation task component'),
          complete: () => {
            this.isInitiated = false;
            this.taskStarted = false;
            this.store.dispatch(new ValidationReportV2.History.Get(this.studyId));
            // if the modifiers array is not empty, we show the info modal
            if (this.modifiers.length > 0) { 
              this.showModal = true; // Show the Info modal
            }

            console.debug('finished & subscription closed.') }
      })
       
      },
      error: (error) => {},
    })
  }

  get buttonText(): string {
    if (this.taskStarted) {
      return 'Awaiting Response'
    } else if (this.isInitiated) {
      return 'Submitting Validation task'
    } 
    else {
      return 'Initiate Validation Task'
    }
  }
  metadataUpdateSync(){
    this.ftpService.startRsync(true, "metadata", "rw-study").subscribe(nextRsyncResponse => {
      this.store.dispatch(new GetGeneralMetadata(this.studyId, false)) // update latest metadata changes
      console.debug(nextRsyncResponse);
    });
  }
  handleConfirmation(result: boolean) {
    this.showModal = false;
    if (result) {
      this.metadataUpdateSync();
    }
  }
}

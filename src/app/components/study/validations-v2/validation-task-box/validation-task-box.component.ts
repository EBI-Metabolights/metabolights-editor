import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { ValidationState, ValidationTask } from 'src/app/ngxs-store/study/validation/validation.state';
import { ViolationType } from '../interfaces/validation-report.types';

@Component({
  selector: 'app-validation-task-box',
  standalone: false,
  templateUrl: './validation-task-box.component.html',
  styleUrl: './validation-task-box.component.css'
})
export class ValidationTaskBoxComponent implements OnInit {

  @Select(ValidationState.currentValidationTask) currentTask$: Observable<ValidationTask>;
  @Select(ValidationState.validationStatus) validationStatus$: Observable<ViolationType>;
  @Select(ValidationState.lastValidationRunTime) lastValidationTime$: Observable<string>;

  buttonTexts = "Initiate Validation Task"
  startButtonClass = "";

  showTaskId = false;
  serverReady = true;

  /** Validation task handling attributes */
  isInitiated = false;
  taskStarted = false;

  taskStates =  ['INITIATED', 'STARTED', 'SUCCESS', 'FAILURE', 'REVOKED', 'PENDING']
  currentTaskState: ValidationTask = {id: "", ws3TaskStatus: "NONE"};

  constructor(private store: Store) {

  }


  ngOnInit(): void {
    this.currentTask$.subscribe((task) => {
      if (task !== null) {
        this.currentTaskState = task;
      }
    })

    this.validationStatus$.subscribe((status) => {
      if (status !== null) {

      }
    });

    this.lastValidationTime$.subscribe((time) => {
      if (time !== null) {
        
      }
    }) 
      
  }

  // we also need this to subscribe to validation task updates so that the user doesnt have to do it.
  startValidationTask() {

    this.store.dispatch(new ValidationReportV2.InitialiseValidationTask(false)).pipe( // currently proxying, this will not work outside of dev
      tap(() => {
        console.log('side effect hit')
        this.isInitiated = true
        
      })
    ).subscribe(
      (next) => {
        //this.isInitiated = false;
        const timer = interval(1000);
        const responseSubscription = timer.pipe(
          takeWhile(value => ["SUCCESS", "FAILURE", "ERROR"].includes(this.currentTaskState.ws3TaskStatus) === false)
        )
        responseSubscription.subscribe(
          () => {
            this.taskStarted = true;
            this.store.dispatch(new ValidationReportV2.Get())},
          error => console.log('Unexpected error in Validation task component'),
          () => {
            this.isInitiated = false;
            this.taskStarted = false;
            console.debug('finished & subscription closed.') }
          )
       
      },
      (error) => {},
      () => {console.log('completed, unsure if this will ever be called.')}
    )
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

}

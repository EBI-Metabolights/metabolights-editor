import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { ValidationReportV2 } from 'src/app/ngxs-store/study/validation/validation.actions';
import { ValidationState, ValidationTask } from 'src/app/ngxs-store/study/validation/validation.state';
import { ViolationType } from '../interfaces/validation-report.types';
import { ValidationPhase } from '../interfaces/validation-report.interface';

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

  lastRunTime = "";
  status = ""

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
        console.log(`taskState: ${this.currentTaskState}`)
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
    }) 
      
  }

  // we also need this to subscribe to validation task updates so that the user doesnt have to do it.
  startValidationTask() {
    const deposedTaskId = this.currentTaskState.id;

    this.store.dispatch(new ValidationReportV2.InitialiseValidationTask(false)).pipe( // currently proxying, this will not work outside of dev
      tap(() => {
        console.log('side effect hit')
        this.isInitiated = true
        
      })
    ).subscribe(
      (next) => {
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

        responseSubscription.subscribe(
          () => {
            this.taskStarted = true;
            this.store.dispatch(new ValidationReportV2.Get(newTask.id))},
          error => console.log('Unexpected error in Validation task component'),
          () => {
            this.isInitiated = false;
            this.taskStarted = false;
            this.store.dispatch(new ValidationReportV2.History.Get());
            console.debug('finished & subscription closed.') }
          )
       
      },
      (error) => {},
      () => {//completed action callback
        }
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

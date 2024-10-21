/* eslint-disable @typescript-eslint/naming-convention */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { interval, Observable, Subscription } from "rxjs";
import { AsyncTaskResponse } from './async-task.interface';
import { HttpClient } from '@angular/common/http';
import { httpOptions } from 'src/app/services/headers';

@Component({
  selector: 'app-async-task',
  templateUrl: './async-task.component.html',
  styleUrls: ['./async-task.component.css']
})
export class AsyncTaskComponent implements OnInit {
  @Input('title') title: string;
  @Input('startButtonLabel') startButtonLabel: string;
  @Input('startButtonIcon') startButtonIcon: string;
  @Input('helpMessage') helpMessage: string;
  @Input('startTaskUrl') startTaskUrl: string;
  @Input('pollTaskStatusUrl') pollTaskStatusUrl: string;
  @Input('pollingInterval') pollingInterval = 10000;
  @Input('taskAction') taskAction: any = null;

  @Output() taskDone = new EventEmitter<any>();

  syncIntervalSubscription: Subscription;

  lastSuccessfulTaskId = "";
  lastResponse: AsyncTaskResponse;
  lastResponseMessage: string;
  initialTaskTracking = true;
  pollTaskInterval: any;
  serverStatusCheckIntervalSubscription: any;
  serverStatusCheckInterval: any;
  isRunning = false;
  RUNNING_STATES = ["INITIATED", "STARTED", "RETRY"];
  RESULT_READY_STATES = ["SUCCESS", "REVOKED", "FAILURE", "PENDING"];
  DONE_STATES = ["SUCCESS"];
  startButtonClass = "start-button-disabled";
  serverReady = false;
  showTaskId = false;
  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.pollTaskInterval = interval(this.pollingInterval);
    this.serverStatusCheckInterval = interval(3000);

    const initialResponse = {
      new_task: false,
      message: "Connecting remote server...",
      task: {
        task_id: "",
        last_status: "",
        last_update_time: 0,
        last_update_time_str: "",
        task_done_time:  0,
        task_done_time_str: ""
      }
    };
    this.updateLastTaskResponse(initialResponse);
    this.checkServerStatus();
  }

  checkServerStatus(): void {
      this.serverStatusCheckIntervalSubscription = this.serverStatusCheckInterval.subscribe(x => {
        if (this.pollTaskStatusUrl && this.initialTaskTracking) {
          this.getAsyncTaskStatus().subscribe(asyncTaskResponse => {
            this.serverReady = true;
            this.initialTaskTracking = false;
            if (asyncTaskResponse.task.task_id.length > 0) {
              if (this.RUNNING_STATES.includes(asyncTaskResponse.task.last_status)) {
                this.start();
              } else if (asyncTaskResponse.task.last_status === "SUCCESS"){
                this.lastSuccessfulTaskId = asyncTaskResponse.task.task_id;
              }
            }
            this.updateLastTaskResponse(asyncTaskResponse);
          });
        }
      });
  }

  public startAsyncTask(): Observable<AsyncTaskResponse> {
    return this.http.post<AsyncTaskResponse>(this.startTaskUrl,{}, httpOptions);
  }


  public getAsyncTaskStatus(): Observable<AsyncTaskResponse> {
    return this.http.get<AsyncTaskResponse>(this.pollTaskStatusUrl, httpOptions);
  }

  start(): void {
    this.startAsyncTask().subscribe(asyncTaskResponse => {
      this.updateLastTaskResponse(asyncTaskResponse);
      this.syncIntervalSubscription = this.pollTaskInterval.subscribe(x => {
        this.getAsyncTaskStatus().subscribe(nextAsyncTaskResponse => {
          this.updateLastTaskResponse(nextAsyncTaskResponse);
        });
      });
    });
  }


  onStartButtonClick(): void {
    if (this.serverReady && !this.isRunning) {
      this.initialTaskTracking = false;
      this.start();
    }
  }


  updateLastTaskResponse(response: AsyncTaskResponse): void {
    this.lastResponse = response;
    if (this.lastResponse == null ||  this.lastResponse.message == null || this.lastResponse.message.length === 0){
      this.lastResponseMessage = "...";
    } else {
      this.lastResponseMessage = this.lastResponse.message;
    }
    if (this.initialTaskTracking) {
      if (this.lastResponse.task.task_done_time > 0){
        this.lastResponse.task.last_update_time = this.lastResponse.task.task_done_time;
      }
    }
    try {
      if (this.RUNNING_STATES.includes(this.lastResponse.task.last_status)) {
        this.isRunning = true;
      } else {
        this.isRunning = false;
        if (this.syncIntervalSubscription !== undefined) {
          this.syncIntervalSubscription.unsubscribe();
          this.serverStatusCheckIntervalSubscription.unsubscribe();
        }
        if (this.serverStatusCheckIntervalSubscription !== undefined) {
          this.serverStatusCheckIntervalSubscription.unsubscribe();
        }
      }
      if (this.lastResponse.task.last_status === "SUCCESS"
        && this.lastSuccessfulTaskId !== this.lastResponse.task.task_id){
        this.lastSuccessfulTaskId = this.lastResponse.task.task_id;
        this.taskDone.emit();
      }

      this.updateButtonClass();
    } catch (exc) {
      console.error(exc);
      this.updateButtonClass();
    }
  }

  updateButtonClass(): void {
    if (this.serverReady) {
      if(this.isRunning) {
        this.startButtonClass = "is-loading";
      } else {
        this.startButtonClass = "start-button";
      }
    } else {
      this.startButtonClass = "start-button-disabled";
    }

  }
}

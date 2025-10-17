/* eslint-disable @typescript-eslint/naming-convention */

import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FTPResponse } from 'src/app/models/mtbl/mtbls/interfaces/generics/ftp-response.interface';
import { FtpManagementService } from 'src/app/services/ftp-management.service';
import { interval, Subscription } from "rxjs";
// eslint-disable-next-line no-shadow
export enum RsyncMode {
  idle,
  dryRun,
  sync
}

export enum SyncEvent {
  metadata,
  files,
  internal,
}

@Component({
    selector: 'app-rsync',
    templateUrl: './rsync.component.html',
    styleUrls: ['./rsync.component.css'],
    standalone: false
})
export class RsyncComponent implements OnInit {
  @Input('title') title  = "Sample Title";
  @Input('helpMessage') helpMessage: string;
  @Input('studyId') studyId: string;
  @Input('sourceStagingArea') sourceStagingArea = "private-ftp";
  @Input('targetStagingArea') targetStagingArea: string;
  @Input('syncType') syncType: string;

  @Input('startSyncLabel') startSyncLabel: string = "Start Synchronisation";
  @Input('syncOnCluster') syncOnCluster = false;
  @Input('dryRunOnCluster') dryRunOnCluster = false;
  @Input('pollingInterval') pollingInterval = 10000;

  @Output() filesSynchronized = new EventEmitter<any>();

  syncIntervalSubscription: Subscription;
  currentMode = RsyncMode.idle;

  lastEmittedTaskId = "invalid";
  lastResponse: FTPResponse;
  lastResponseDescription: string;
  initialTaskTracking = true;

  isRunning = false;
  rsyncMode = RsyncMode;
  rsyncInterval: any;
  RUNNING_STATES = ["CALCULATING", "RUNNING", "PENDING", "JOB_SUBMITTED"];
  RESULT_READY_STATES = ["SYNC_NEEDED", "SYNC_NOT_NEEDED", "CALCULATION_FAILURE",
      "COMPLETED_SUCCESS", "SYNC_FAILURE", "START_FAILURE", "JOB_SUBMISSION_FAILED"];
  DONE_STATES = ["SYNC_NEEDED", "SYNC_NOT_NEEDED", "COMPLETED_SUCCESS"];
  dryRunButtonClass = "ftp-button";
  syncButtonClass = "ftp-button";
  serverReady = false;
  currentTaskName = "";
  showTaskId = false;
  constructor(
    private ftpService: FtpManagementService,
  ) {

  }

  ngOnInit(): void {
    this.rsyncInterval = interval(this.pollingInterval);
    const initialResponse = {
        new_task: false,
        description: "",
        last_update_time: "", // need to tweak the UI so that we get pascalcase in response
        last_update_timestamp: 0,
        status: "NO_TASK",
        task_done_time_str: "",
        task_done_timestamp:  0,
        task_id:  "",
        dry_run: true
    };
    this.updateLastRsyncResponse(initialResponse);
    // this.ftpService.getRyncStatus(true, this.syncType, this.targetStagingArea).subscribe(dryRunResponse => {
    //   this.ftpService.getRyncStatus(false, this.syncType, this.targetStagingArea).subscribe(syncResponse => {
    //     this.serverReady = true;
    //     if (this.RUNNING_STATES.includes(syncResponse.status)) {
    //       this.currentMode = this.rsyncMode.sync;
    //       this.startRsync(false, this.syncType, this.targetStagingArea);
    //     } else if (this.RUNNING_STATES.includes(dryRunResponse.status)){
    //       this.currentMode = this.rsyncMode.dryRun;
    //       this.startRsync(true, this.syncType, this.targetStagingArea);
    //     } else if (this.RESULT_READY_STATES.includes(syncResponse.status)){
    //       this.updateLastRsyncResponse(syncResponse);
    //     } else if (this.RESULT_READY_STATES.includes(dryRunResponse.status)){
    //       this.updateLastRsyncResponse(dryRunResponse);
    //     } else if (this.DONE_STATES.includes(syncResponse.status)){
    //       this.updateLastRsyncResponse(syncResponse);
    //     } else if (this.DONE_STATES.includes(dryRunResponse.status)){
    //       this.updateLastRsyncResponse(dryRunResponse);
    //     } else {
    //       if (this.lastResponse.task_done_timestamp > 0) {
    //         this.updateLastRsyncResponse(this.lastResponse);
    //       }
    //     }
    //   });
    // });
  }

  startRsync(dryRun: boolean=false, syncType: string, targetStagingArea: string): void {

    this.ftpService.startRsync(dryRun, syncType, targetStagingArea).subscribe(ftpResponse => {
      this.updateLastRsyncResponse(ftpResponse);
      this.syncIntervalSubscription = this.rsyncInterval.subscribe(x => {
        this.ftpService.getRyncStatus(dryRun, syncType, targetStagingArea).subscribe(nextRsyncResponse => {
          this.updateLastRsyncResponse(nextRsyncResponse);
        });
      });
    });
  }


  onDryRunClick(): void {
    if (!this.isRunning) {
      this.initialTaskTracking = false;
      this.currentMode = this.rsyncMode.dryRun;
      this.startRsync(true, this.syncType, this.targetStagingArea);
    }
  }


  updateLastRsyncResponse(response: FTPResponse): void {
    this.lastResponse = response;
    if (this.lastResponse == null ||  this.lastResponse.description == null || this.lastResponse.description.length === 0){
      this.lastResponseDescription = "...";
    } else {
      this.lastResponseDescription = this.lastResponse.description;
    }
    this.currentTaskName = "";
    if (this.serverReady && this.currentMode === RsyncMode.dryRun) {
      this.currentTaskName = "Check Updates";
    } else if(this.serverReady && this.currentMode === RsyncMode.sync) {
      this.currentTaskName = "Start Synchronization";
    } else {
      if ( this.lastResponse.task_id !== "") {
        this.currentTaskName = (this.lastResponse.dry_run === true ) ? "Check Updates" : "Start Synchronization";
      } else {
        this.currentTaskName = "No Task";
      }

      if (this.lastResponse.task_done_timestamp > 0){
        this.lastResponse.last_update_time = this.lastResponse.task_done_time_str;
        this.lastResponse.last_update_timestamp = this.lastResponse.task_done_timestamp;
      }
    }
    try {
      if (this.RUNNING_STATES.includes(this.lastResponse.status)) {
        this.isRunning = true;

      } else {
        this.isRunning = false;
        this.currentMode = this.rsyncMode.idle;
        if (this.syncIntervalSubscription) {
          this.syncIntervalSubscription.unsubscribe();
        }
        // if (this.RESULT_READY_STATES.includes(this.lastResponse.status)) {
        //   this.currentMode = this.rsyncMode.idle;
        // }
      }
      if (!this.initialTaskTracking && this.lastResponse
        && this.lastResponse.status === "COMPLETED_SUCCESS"
        && this.lastEmittedTaskId !== this.lastResponse.task_id){
        this.lastEmittedTaskId = this.lastResponse.task_id;

        // want to have this emit something to indicate what sort of sync has taken place.
        this.filesSynchronized.emit(SyncEvent[this.syncType as keyof typeof SyncEvent]);
      }

      this.updateButtons();
    } catch (exc) {
      console.error(exc);
      this.updateButtons();
      this.currentMode = this.rsyncMode.idle;
    }
  }

  onSyncClick(): void {
    if (!this.isRunning) {
      this.initialTaskTracking = false;
      this.currentMode = this.rsyncMode.sync;
      this.startRsync(false, this.syncType, this.targetStagingArea);
    }
  }

  updateButtons(): void {
    if (this.serverReady) {
      if(this.isRunning) {
        if (this.currentMode === this.rsyncMode.dryRun) {
          this.dryRunButtonClass = "is-loading";
          this.syncButtonClass = "ftp-button-disabled";
        } else if (this.currentMode === this.rsyncMode.sync){
          this.syncButtonClass = "is-loading";
          this.dryRunButtonClass = "ftp-button-disabled";
        } else {
          this.dryRunButtonClass = "ftp-button";
          this.syncButtonClass = "ftp-button";
        }
      } else {
        this.dryRunButtonClass = "ftp-button";
        this.syncButtonClass = "ftp-button";
      }
    } else {
      this.dryRunButtonClass = "ftp-button";
      this.syncButtonClass = "ftp-button";
    }

  }
}

/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'rsyncStatusTransform'})
export class RsyncStatusTransformPipe implements PipeTransform {
    register = {
        NO_TASK: '-',
        UNKNOWN: 'Unknown',
        SYNC_NEEDED: 'Task completed. Sync Needed',
        SYNC_NOT_NEEDED: 'Task completed. Sync not Needed',
        CALCULATING: 'Processing ...',
        CALCULATION_FAILURE: 'Check failure',
        NOT_FOUND: "No Task Found",
        PENDING: 'Task is in Queue ...',
        RUNNING: 'TAsk is running ...',
        COMPLETED_SUCCESS: "Task completed. Sync Completed",
        SYNC_FAILURE: "Sync failure",
        START_FAILURE: "Start failure",
        JOB_SUBMITTED: "Task has been submitted ...",
        JOB_SUBMISSION_FAILED: "Start failure"
      };

    transform(value: string): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "Unknown";
    }
}

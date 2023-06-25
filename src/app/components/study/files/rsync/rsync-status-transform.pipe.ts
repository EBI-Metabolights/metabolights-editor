/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'rsyncStatusTransform'})
export class RsyncStatusTransformPipe implements PipeTransform {
    register = {
        NO_TASK: '-',
        UNKNOWN: 'Unknown',
        SYNC_NEEDED: 'Done. Sync Needed',
        SYNC_NOT_NEEDED: 'Done. Sync not Needed',
        CALCULATING: 'Processing ...',
        CALCULATION_FAILURE: 'Check failure',
        NOT_FOUND: "Not Found",
        PENDING: 'In Queue ...',
        RUNNING: 'Running ...',
        COMPLETED_SUCCESS: "Done. Sync Completed",
        SYNC_FAILURE: "Sync failure",
        START_FAILURE: "Start failure",
        JOB_SUBMITTED: "Submitted ...",
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

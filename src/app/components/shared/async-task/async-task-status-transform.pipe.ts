/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'asyncTaskStatusTransform'})
export class AsyncStatusTransformPipe implements PipeTransform {
    register = {
        PENDING: '-',
        INITIATED: 'In Queue ...',
        STARTED: 'Started ...',
        SUCCESS: 'Done',
        RETRY: 'Retrying ... ',
        FAILURE: "Failed",
        REVOKED: "Canceled"
      };

    transform(value: string): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "-";
    }
}

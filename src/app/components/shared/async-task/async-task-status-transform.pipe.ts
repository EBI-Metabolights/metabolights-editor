/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({
    name: 'asyncTaskStatusTransform',
    standalone: false
})
export class AsyncStatusTransformPipe implements PipeTransform {
    register = {
        PENDING: '-',
        INITIATED: 'Task is in queue ...',
        STARTED: 'Task has started ...',
        SUCCESS: 'Task has completed.',
        RETRY: 'Retrying ... ',
        FAILURE: "Task has failed.",
        REVOKED: "Task has canceled."
      };

    transform(value: string): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "-";
    }
}

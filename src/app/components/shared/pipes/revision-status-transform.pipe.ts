/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'revisionStatusTransform'})
export class RevisionStatusTransformPipe implements PipeTransform {
    register = {
        0: 'Initiated',
        1: 'In Progress',
        2: 'Failed',
        3: 'Completed',
        null: '',
      };

    transform(value: number): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "";
    }
}

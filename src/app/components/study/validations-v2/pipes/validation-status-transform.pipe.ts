/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({
    name: 'validationStatusTransform',
    standalone: false
})
export class ValidationStatusTransformPipe implements PipeTransform {
    register = {
        error: 'Failed',
        success: 'Success',
        warning: 'Success',
        "not ready": 'Required'
      };

    transform(value: string): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "Unknown";
    }
}

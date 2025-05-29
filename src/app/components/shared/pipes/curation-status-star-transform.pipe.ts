/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'curationStatusTransform'})
export class CurationStatusTransformPipe implements PipeTransform {
    register = {
        "MANUAL_CURATION": '★★★',
        "NO_CURATION": '★★',
        null: '★',
      };

    transform(value: number): string {
      const result = this.register[value];
      if (result !== undefined){
        return result;
      }
      return "";
    }
}

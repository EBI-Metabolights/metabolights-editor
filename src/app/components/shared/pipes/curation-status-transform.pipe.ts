/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from "@angular/core";



@Pipe({
    name: 'curationStatusTransform',
    standalone: false
})
export class CurationStatusTransformPipe implements PipeTransform {
    register = {
        "MANUAL_CURATION": 'MetaboLights',
        "NO_CURATION": 'Minimum',
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

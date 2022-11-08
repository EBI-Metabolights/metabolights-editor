import { Pipe, PipeTransform } from "@angular/core";


@Pipe({name: 'timezoneTransform'})
export class TimezoneTransformPipe implements PipeTransform {

    transform(serverTimestamp:string) {
      if (serverTimestamp ===  'N/A' || serverTimestamp ===  '...' || serverTimestamp === 'NONE' || serverTimestamp === '') {
        return  'N/A';
      }
      return new Date(
            new Date(serverTimestamp).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
            );
    }
}

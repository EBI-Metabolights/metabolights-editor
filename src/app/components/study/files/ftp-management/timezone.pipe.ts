import { Pipe, PipeTransform } from "@angular/core";


@Pipe({name: 'timezoneTransform'})
export class TimezoneTransformPipe implements PipeTransform {

    transform(serverTimestamp:string) {
      if (serverTimestamp === 'None' || serverTimestamp === undefined || serverTimestamp ===  'N/A' || serverTimestamp ===  '...') {
        return  'None';
      }
      return new Date(
            new Date(serverTimestamp).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
            );
    }
}

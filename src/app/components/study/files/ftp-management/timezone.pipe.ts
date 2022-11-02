import { Pipe, PipeTransform } from "@angular/core";


@Pipe({name: 'timezoneTransform'})
export class TimezoneTransformPipe implements PipeTransform {

    transform(serverTimestamp:string) {
      console.log(' time ' + serverTimestamp);
      if (serverTimestamp ===  'N/A' || serverTimestamp ===  '...') {
        return  '';
      }
      return new Date(
            new Date(serverTimestamp).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)
            );
    }
}

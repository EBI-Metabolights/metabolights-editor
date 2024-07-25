import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'handleUnderscoreInReport',
  standalone: true
})
export class HandleUnderscoreInReportPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) return value;
    
        return value.replace(/_./g, (match) => ' ' + match.charAt(1).toUpperCase());
      }
}
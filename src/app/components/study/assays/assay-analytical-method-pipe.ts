import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amPipe'
})
export class AnalyticalMethodPipe implements PipeTransform {
  transform(value: string): string {
    // Add transformation logic here
    let modifiedValue = null;
    modifiedValue = value.split('_').slice(2).join('_').replace("_metabolite_profiling.txt", "").replace("_", " ").replace("_", " ");

    return modifiedValue;
  }
}
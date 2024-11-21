import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberDuplicates'
})
export class NumberDuplicatesPipe implements PipeTransform {
  transform(array: string[]): string[] {
    const occurrenceMap: { [key: string]: number } = {};
    return array.map(item => {
      occurrenceMap[item] = (occurrenceMap[item] || 0) + 1;
      if (occurrenceMap[item] > 1) {
        return `${item} (${occurrenceMap[item] - 1})`;
      }
      return item;
    });
  }
}
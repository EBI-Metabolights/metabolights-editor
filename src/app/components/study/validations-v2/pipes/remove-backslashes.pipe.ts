import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeBackslashes',
  standalone: true

})
export class RemoveBackslashesPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }
    return value.replace(/\\/g, '');
  }
}
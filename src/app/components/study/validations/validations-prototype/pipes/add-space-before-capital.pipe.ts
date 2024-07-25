import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaceBeforeCapital',
  standalone: true
})
export class AddSpaceBeforeCapitalPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    const spaced = value.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationDateFormat',
  standalone: true
})
export class ValidationDateFormatPipe implements PipeTransform {
  transform(value: string): Date {
    const [datePart, timePart] = value.split('_');
    const [year, month, day] = datePart.split('-');
    return new Date(`${year}-${month}-${day}T${timePart.replace(/-/g, ':')}`);
  }
}

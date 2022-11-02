import { Pipe, PipeTransform } from "@angular/core";



@Pipe({name: 'calculationTransform'})
export class CalculationTransformPipe implements PipeTransform {
    register = {
        NO_TASK: 'Nothing to do',
        UNKNOWN: 'Status unknown, potential error',
        SYNC_NEEDED: 'New files to be synchronised',
        SYNC_NOT_NEEDED: 'No new files to synchronise',
        CALCULATING: 'Scanning...'
      }
    
    transform(value: string): string {
        return this.register[value]
    }
}
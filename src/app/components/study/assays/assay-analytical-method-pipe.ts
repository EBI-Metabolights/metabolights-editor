import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amPipe'
})
export class AnalyticalMethodPipe implements PipeTransform {
  transform(value: string): string {
    // Add transformation logic here
    /*let modifiedValue = null;
    modifiedValue = value.split('_').slice(2).join('_')
      .replace("_metabolite_profiling.txt", "")
      .replace(/_metabolite_profiling-\d+\.txt/, "")
      .replace("_", " ")
      .replace("_", " ").trimRight();*/
    
    let transformedVal = null;
    transformedVal = value.split('_').slice(2).join('_');
    value.indexOf(".tsv") > -1 ? transformedVal = this.mafTransform(transformedVal) : transformedVal = this.assayTransform(transformedVal)
    transformedVal = transformedVal
      .replace("_", " ")
      .replace("_", " ").trimRight();
    return transformedVal;
  }

  assayTransform(val: string): string {
    let modifiedVal = val.replace("_metabolite_profiling.txt", "")
      .replace(/_metabolite_profiling-\d+\.txt/, "")
    return modifiedVal
  }

  mafTransform(val: string): string {
    let modifiedVal = val.replace("_metabolite_profiling_v2_maf.tsv", "")
      .replace(/_metabolite_profiling-\d+\_v2_maf.tsv/, "")
    return modifiedVal
  }
}
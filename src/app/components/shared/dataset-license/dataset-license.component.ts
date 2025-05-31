import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { DatasetLicense } from 'src/app/services/decomposed/dataset-license.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripTermsOfUse'
})
export class StripTermsOfUsePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/ terms of use/i, '').trim();
  }
}


@Component({
  selector: 'mtbls-dataset-license',
  standalone: false,
  templateUrl: './dataset-license.component.html',
  styleUrl: './dataset-license.component.css'
})
export class DatasetLicenseComponent implements OnInit {

  datasetLicense$: Observable<DatasetLicense> = inject(Store).select(GeneralMetadataState.datasetLicense);

  datasetLicense: DatasetLicense = null;

  ngOnInit(): void {
      this.datasetLicense$.pipe(filter(val => val !== null)).subscribe((dl) => {
        this.datasetLicense = dl;
      });
  }

  goTermsOfUse() {
    if(this.datasetLicense.licenseUrl && this.datasetLicense.licenseUrl.length > 0 ) {
      window.open(this.datasetLicense.licenseUrl, '_blank');
    }
  }

}

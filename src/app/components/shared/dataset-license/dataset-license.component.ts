import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, Observable } from 'rxjs';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { DatasetLicense } from 'src/app/services/decomposed/dataset-license.service';

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

}

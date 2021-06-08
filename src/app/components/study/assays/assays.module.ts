import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAssayComponent } from './add-assay/add-assay.component';
import { AssayDetailsComponent } from './assay-details/assay-details.component';
import { AssaysContainerComponent } from './assays-container/assays-container.component';



@NgModule({
  declarations: [
    AddAssayComponent,
    AssayDetailsComponent,
    AssaysContainerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AddAssayComponent,
    AssayDetailsComponent,
    AssaysContainerComponent
  ]
})
export class AssaysModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssaysComponent } from './assays/assays.component';
import { AddAssayComponent } from './assays/add-assay/add-assay.component';
import { AssayDetailsComponent } from './assays/assay-details/assay-details.component';
import { DeleteComponent } from './delete/delete.component';
import { DescriptionComponent } from './description/description.component';
import { DesignDescriptorsComponent } from './design-descriptors/design-descriptors.component';
import { DesignDescriptorComponent } from './design-descriptors/design-descriptor/design-descriptor.component';
import { FactorsComponent } from './factors/factors.component';
import { FactorComponent } from './factors/factor/factor.component';
import { FilesComponent } from './files/files.component';
import { MafsComponent } from './mafs/mafs.component';
import { MafComponent } from './mafs/maf/maf.component';
import { OntologyComponent } from './ontology/ontology.component';
import { OntologyDetailsComponent } from './ontology/ontology-details/ontology-details.component';
import { OrganismsComponent } from './organisms/organisms.component';
import { OrganismComponent } from './organisms/organism/organism.component';
import { PeopleComponent } from './people/people.component';
import { PersonComponent } from './people/person/person.component';
import { ProtocolsComponent } from './protocols/protocols.component';
import { ProtocolComponent } from './protocols/protocol/protocol.component';
import { PublicationsComponent } from './publications/publications.component';
import { PublicationComponent } from './publications/publication/publication.component';
import { ReleaseDateComponent } from './release-date/release-date.component';
import { SamplesComponent } from './samples/samples.component';
import { StatusComponent } from './status/status.component';
import { TitleComponent } from './title/title.component';
import { ValidationsComponent } from './validations/validations.component';
import { ValidationDetailComponent } from './validations/validation-detail/validation-detail.component';
import { MatExpansionModule} from '@angular/material/expansion';
import { NgReduxModule } from '@angular-redux/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ValidationDetailCommentComponent } from './validations/validation-detail/validation-detail-comment/validation-detail-comment.component';
import {MatDividerModule} from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';




@NgModule({
  declarations: [
    AssaysComponent,
    AddAssayComponent, 
    AssayDetailsComponent, 
    DeleteComponent, 
    DescriptionComponent, 
    DesignDescriptorsComponent, 
    DesignDescriptorComponent,
    FactorsComponent,
    FactorComponent,
    FilesComponent,
    MafsComponent,
    MafComponent,
    OntologyComponent,
    OntologyDetailsComponent,
    OrganismsComponent,
    OrganismComponent,
    PeopleComponent,
    PersonComponent,
    ProtocolsComponent,
    ProtocolComponent,
    PublicationsComponent,
    PublicationComponent,
    ReleaseDateComponent,
    SamplesComponent,
    StatusComponent,
    TitleComponent,
    ValidationsComponent,
    ValidationDetailComponent,
    ValidationDetailCommentComponent
],
  imports: [
    CommonModule,
    HttpClientModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    NgReduxModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    SharedModule,
    MatButtonModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule

  ],
  exports: [
    AssaysComponent,
    AddAssayComponent, 
    AssayDetailsComponent, 
    DeleteComponent, 
    DescriptionComponent, 
    DesignDescriptorsComponent, 
    DesignDescriptorComponent,
    FactorsComponent,
    FactorComponent,
    FilesComponent,
    MafsComponent,
    MafComponent,
    OntologyComponent,
    OntologyDetailsComponent,
    OrganismsComponent,
    OrganismComponent,
    PeopleComponent,
    PersonComponent,
    ProtocolsComponent,
    ProtocolComponent,
    PublicationsComponent,
    PublicationComponent,
    ReleaseDateComponent,
    SamplesComponent,
    StatusComponent,
    TitleComponent,
    ValidationsComponent,
    ValidationDetailComponent,
    ValidationDetailCommentComponent
  ]
})
export class StudyModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from './content/content.component';
import { DeleteFileComponent } from './delete-file/delete-file.component';
import { DirectoryComponent } from './directory/directory.component';
import { DownloadComponent } from './download/download.component';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { HelpComponent } from './help/help.component';
import { LoadingComponent } from './loading/loading.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { QuickLinkComponent } from './quick-link/quick-link.component';
import { TableComponent } from './table/table.component';
import { UploadComponent } from './upload/upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgReduxModule } from '@angular-redux/store';
import { AsperaDownloadComponent } from './download/aspera/aspera.component';
import { FtpDownloadComponent } from './download/ftp/ftp.component';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FTPUploadComponent } from './upload/ftp/ftp.component';
import { AsperaUploadComponent } from './upload/aspera/aspera.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DesignDescriptorsComponent } from './design-descriptors/design-descriptors.component';
import { DesignDescriptorComponent } from './design-descriptors/design-descriptor/design-descriptor.component';
import { TitleComponent } from './title/title.component';
import { DescriptionComponent } from './description/description.component';
import { PeopleComponent } from './people/people.component';
import { PersonComponent } from './people/person/person.component';
import { OntologyDetailsComponent } from './ontology/ontology-details/ontology-details.component';
import { MatInputModule } from '@angular/material/input';
import { OntologyComponent } from './ontology/ontology.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddAssayComponent } from './add-assay/add-assay.component';
import { MatTableModule } from '@angular/material/table';
import { AngularStickyThingsModule } from '@w11k/angular-sticky-things';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { AuthGuard } from 'src/app/auth-guard.service';
import { EditorService } from 'src/app/services/editor.service';
import { AuthService } from 'src/app/services/metabolights/auth.service';
import { MetabolightsService } from 'src/app/services/metabolights/metabolights.service';
import { DOIService } from 'src/app/services/publications/doi.service';
import { EuropePMCService } from 'src/app/services/publications/europePMC.service';
import { LabsWorkspaceService } from 'src/app/services/labs-workspace.service';
import { EditTableDirective } from 'src/app/directives/edit-table.directive';
import { QuillModule } from 'ngx-quill';


/**
 * TODO: break this shared module out so that it doesnt become bloated. One lot of components that can be broken out are components common to different study views
 * 
 */
@NgModule({
  declarations: [
    AddAssayComponent, 
    ContentComponent,
    DeleteFileComponent,
    DirectoryComponent,
    DownloadComponent,
    AsperaDownloadComponent,
    FtpDownloadComponent,
    PageNotFoundComponent,
    HelpComponent,
    LoadingComponent,
    NavBarComponent,
    QuickLinkComponent,
    TableComponent,
    UploadComponent,
    FTPUploadComponent,
    AsperaUploadComponent,
    DesignDescriptorsComponent,
    DesignDescriptorComponent,
    TitleComponent,
    DescriptionComponent, 
    PeopleComponent,
    PersonComponent,
    OntologyComponent,
    OntologyDetailsComponent,
    EditTableDirective



  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgReduxModule,
    RouterModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    AngularStickyThingsModule,
    MatButtonModule,
    MatButtonToggleModule,
    QuillModule,
    

  ],
  exports: [
    AddAssayComponent, 
    ContentComponent,
    DeleteFileComponent,
    DirectoryComponent,
    DownloadComponent,
    AsperaDownloadComponent,
    FtpDownloadComponent,
    PageNotFoundComponent,
    HelpComponent,
    LoadingComponent,
    NavBarComponent,
    QuickLinkComponent,
    TableComponent,
    UploadComponent,
    FTPUploadComponent,
    AsperaUploadComponent,
    DesignDescriptorsComponent,
    DesignDescriptorComponent,
    TitleComponent,
    DescriptionComponent,
    PeopleComponent,
    PersonComponent,
    OntologyComponent,
    OntologyDetailsComponent,
  ],
  providers: [
    AuthGuard,
    EditorService,
    MetabolightsService,
    EuropePMCService,
    DOIService,
    AuthService,
    LabsWorkspaceService
  ]
})
export class SharedModule { }

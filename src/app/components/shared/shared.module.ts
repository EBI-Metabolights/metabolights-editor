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
import { OntologyDetailsComponent } from './ontology-details/ontology-details.component';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
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
    OntologyDetailsComponent,


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
    MatInputModule

  ],
  exports: [
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
    OntologyDetailsComponent,


  ]
})
export class SharedModule { }

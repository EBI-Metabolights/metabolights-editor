import { NgReduxRouterModule, NgReduxRouter } from '@angular-redux/router';
import { NgReduxModule, NgRedux, DevToolsExtension } from '@angular-redux/store';
import { AngularStickyThingsModule } from '@w11k/angular-sticky-things';

import { IAppState, rootReducer, INITIAL_STATE } from './store';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StudyComponent } from './components/study/study.component';

import { AuthGuard } from './auth-guard.service';
import { LoginComponent } from './components/auth/login/login.component';
import { ConsoleComponent } from './components/console/console.component';

import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NavBarComponent } from './components/shared/nav-bar/nav-bar.component';
import { HelpComponent } from './components/shared/help/help.component';
import { CreateComponent } from './components/guide/create/create.component';
import { InfoComponent } from './components/guide/info/info.component';
import { RawUploadComponent } from './components/guide/upload/upload.component';
import { PageNotFoundComponent } from './components/shared/errors/page-not-found/page-not-found.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { ProgressComponent } from './components/guide/progress/progress.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UploadComponent } from './components/shared/upload/upload.component';
import { DownloadComponent } from './components/shared/download/download.component';
import { AsperaComponent } from './components/shared/upload/aspera/aspera.component';
import { AsperaDownloadComponent } from './components/shared/download/aspera/aspera.component';
import { FTPComponent } from './components/shared/upload/ftp/ftp.component';
import { MetaComponent } from './components/guide/meta/meta.component';
import { DesignDescriptorsComponent } from './components/study/design-descriptors/design-descriptors.component';
import { DesignDescriptorComponent } from './components/study/design-descriptors/design-descriptor/design-descriptor.component';
import { OntologyComponent } from './components/study/ontology/ontology.component';
import { OntologyDetailsComponent } from './components/study/ontology/ontology-details/ontology-details.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PeopleComponent } from './components/study/people/people.component';
import { PersonComponent } from './components/study/people/person/person.component';
import { DescriptionComponent } from './components/study/description/description.component';
import { TitleComponent } from './components/study/title/title.component';

import { NgxWigModule } from 'ngx-wig';
import { GuidedAssaysComponent } from './components/guide/assays/assays.component';
import { AddAssayComponent } from './components/study/assays/add-assay/add-assay.component';
import { AssaysComponent } from './components/study/assays/assays.component';
import { AssayDetailsComponent } from './components/study/assays/assay-details/assay-details.component';
import { ProtocolsComponent } from './components/study/protocols/protocols.component';
import { ProtocolComponent } from './components/study/protocols/protocol/protocol.component';
import { ContentComponent } from './components/shared/content/content.component';
import { SamplesComponent } from './components/study/samples/samples.component';
import { TableComponent } from './components/shared/table/table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MafsComponent } from './components/study/mafs/mafs.component';
import { MafComponent } from './components/study/mafs/maf/maf.component';
import { MatSelectModule } from '@angular/material/select';
import { FactorsComponent } from './components/study/factors/factors.component';
import { FactorComponent } from './components/study/factors/factor/factor.component';
import { StatusComponent } from './components/study/status/status.component';
import { ReleaseDateComponent } from './components/study/release-date/release-date.component';
import { OrganismsComponent } from './components/study/organisms/organisms.component';
import { OrganismComponent } from './components/study/organisms/organism/organism.component';
import { PublicationsComponent } from './components/study/publications/publications.component';
import { PublicationComponent } from './components/study/publications/publication/publication.component';
import { FilesComponent } from './components/study/files/files.component';
import { QuickLinkComponent } from './components/shared/quick-link/quick-link.component';
import { ValidationsComponent } from './components/study/validations/validations.component';
import { LoadingComponent } from './components/shared/loading/loading.component';
import { EditTableDirective } from './directives/edit-table.directive';

import { QuillModule } from 'ngx-quill';
import { DirectoryComponent } from './components/shared/directory/directory.component';
import { LazyLoadImagesDirective } from './directives/lazy-load-images.directive';
import { DeleteFileComponent } from './components/shared/delete-file/delete-file.component';
import { PublicStudyComponent } from './components/public/study/study.component';
import { DeleteComponent } from './components/study/delete/delete.component';
import { HeaderComponent } from './components/public/header/header.component';
import { FooterComponent } from './components/public/footer/footer.component';
import { PathwaysComponent } from './components/public/pathways/pathways.component';
import { FtpDownloadComponent } from './components/shared/download/ftp/ftp.component';

@NgModule({
  declarations: [
    AppComponent,
    StudyComponent,
    PublicStudyComponent,
    LoginComponent,
    ConsoleComponent,
    NavBarComponent,
    HelpComponent,
    PublicStudyComponent,
    CreateComponent,
    PageNotFoundComponent,
    ProgressComponent,
    RawUploadComponent,
    InfoComponent,
    OntologyComponent,
    OntologyDetailsComponent,
    UploadComponent,
    PeopleComponent,
    PersonComponent,
    DownloadComponent,
    AsperaComponent,
    DesignDescriptorsComponent,
    DesignDescriptorComponent,
    DescriptionComponent,
    FTPComponent,
    MetaComponent,
    TitleComponent,
    GuidedAssaysComponent,
    AssaysComponent,
    AddAssayComponent,
    AssayDetailsComponent,
    ProtocolsComponent,
    ProtocolComponent,
    ContentComponent,
    SamplesComponent,
    TableComponent,
    MafsComponent,
    MafComponent,
    FactorsComponent,
    FactorComponent,
    StatusComponent,
    ReleaseDateComponent,
    OrganismsComponent,
    OrganismComponent,
    PublicationsComponent,
    PublicationComponent,
    FilesComponent,
    QuickLinkComponent,
    ValidationsComponent,
    LoadingComponent,
    EditTableDirective,
    DirectoryComponent,
    LazyLoadImagesDirective,
    DeleteFileComponent,
    DeleteComponent,
    HeaderComponent,
    FooterComponent,
    PathwaysComponent,
    AsperaDownloadComponent,
    FtpDownloadComponent,
  ],
  imports: [
    BrowserModule,
    NgxWigModule,
    HttpModule,
    AppRoutingModule,
    NgReduxModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTableModule,
    AngularStickyThingsModule,
    DragDropModule,
    NgReduxRouterModule.forRoot(),
    QuillModule.forRoot({
      modules: {
        clipboard: {
          matchVisual: false
        }
      }
    })
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
	constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension, ngReduxRouter: NgReduxRouter) {
        let enhancers = (isDevMode() && devTools.enhancer() != null) ? [devTools.enhancer()] : []
        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancers);
    }
}

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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NgxWigModule } from 'ngx-wig';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { EditTableDirective } from './directives/edit-table.directive';

import { QuillModule } from 'ngx-quill';
import { LazyLoadImagesDirective } from './directives/lazy-load-images.directive';
import { PublicStudyComponent } from './components/public/study/study.component';
import { HeaderComponent } from './components/public/header/header.component';
import { FooterComponent } from './components/public/footer/footer.component';
import { GuidesComponent } from './components/public/guides/guides.component';
import { StudyModule } from './components/study/study.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './components/shared/shared.module';
import { GuideModule } from './components/guide/guide.module';
import { EditorService } from './services/editor.service';
import { MetabolightsService } from './services/metabolights/metabolights.service';
import { DOIService } from './services/publications/doi.service';
import { AuthService } from './services/metabolights/auth.service';
import { EuropePMCService } from './services/publications/europePMC.service';

@NgModule({
  declarations: [
    AppComponent,
    StudyComponent,
    PublicStudyComponent,
    LoginComponent,
    ConsoleComponent,
    PublicStudyComponent,
    EditTableDirective,
    LazyLoadImagesDirective,
    HeaderComponent,
    FooterComponent,
    GuidesComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxWigModule,
    StudyModule,
    SharedModule,
    GuideModule,
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
  exports: [

  ],
  providers: [
    AuthGuard,
    EditorService,
    MetabolightsService,
    EuropePMCService,
    DOIService,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
	constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension, ngReduxRouter: NgReduxRouter) {
        let enhancers = (isDevMode() && devTools.enhancer() != null) ? [devTools.enhancer()] : []
        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancers);
    }
}

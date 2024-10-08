
import {APP_BASE_HREF, PlatformLocation} from '@angular/common';

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, isDevMode, APP_INITIALIZER, Injector } from "@angular/core";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { StudyComponent } from "./components/study/study.component";
import { AuthGuard } from "./auth-guard.service";
import { LoginComponent } from "./components/auth/login/login.component";
import { ConsoleComponent } from "./components/console/console.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatChipsModule } from "@angular/material/chips";
import { MatCheckboxModule } from "@angular/material/checkbox";

import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";

import { QuillModule } from "ngx-quill";
import { LazyLoadImagesDirective } from "./directives/lazy-load-images.directive";
import { PublicStudyComponent } from "./components/public/study/study.component";
import { HeaderComponent } from "./components/public/header/header.component";
import { FooterComponent } from "./components/public/footer/footer.component";
import { GuidesComponent } from "./components/public/guides/guides.component";
import { StudyModule } from "./components/study/study.module";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { SharedModule } from "./components/shared/shared.module";
import { GuideModule } from "./components/guide/guide.module";
import { ConfigurationService } from "./configuration.service";
import { EditorService } from "./services/editor.service";
import { MetabolightsService } from "./services/metabolights/metabolights.service";
import { DOIService } from "./services/publications/doi.service";
import { AuthService } from "./services/metabolights/auth.service";
import { EuropePMCService } from "./services/publications/europePMC.service";
import { LabsWorkspaceService } from "./services/labs-workspace.service";
import { HeaderInterceptor } from "./services/interceptors/header.interceptor";
import { NgxsModule } from "@ngxs/store";
import { TransitionsState } from "./ngxs-store/non-study/transitions/transitions.state";
import { UserState } from "./ngxs-store/non-study/user/user.state";
import { ApplicationState } from "./ngxs-store/non-study/application/application.state";
import { GeneralMetadataState } from "./ngxs-store/study/general-metadata/general-metadata.state";
import { FilesState } from "./ngxs-store/study/files/files.state";
import { AssayState } from "./ngxs-store/study/assay/assay.state";
import { MAFState } from "./ngxs-store/study/maf/maf.state";
import { SampleState } from "./ngxs-store/study/samples/samples.state";
import { ProtocolsState } from "./ngxs-store/study/protocols/protocols.state";
import { DescriptorsState } from "./ngxs-store/study/descriptors/descriptors.state";
import { ValidationState } from "./ngxs-store/study/validation/validation.state";
import { DescriptorInterceptor } from "./services/interceptors/descriptor.interceptor";
import { FactorInterceptor } from "./services/interceptors/factor.interceptor";
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
export function configLoader(injector: Injector): () => Promise<any> {
  return () => injector.get(ConfigurationService).loadConfiguration();
}

@NgModule({ declarations: [
        AppComponent,
        StudyComponent,
        PublicStudyComponent,
        LoginComponent,
        ConsoleComponent,
        PublicStudyComponent,
        LazyLoadImagesDirective,
        HeaderComponent,
        FooterComponent,
        GuidesComponent,
    ],
    exports: [],
    bootstrap: [AppComponent], imports: [BrowserModule,
        StudyModule,
        SharedModule,
        GuideModule,
        AppRoutingModule,
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
        DragDropModule,
        NgxsModule.forRoot([
            UserState,
            TransitionsState,
            ApplicationState,
            GeneralMetadataState,
            FilesState,
            AssayState,
            MAFState,
            SampleState,
            ProtocolsState,
            DescriptorsState,
            ValidationState
        ], { developmentMode: true }),
        NgxsReduxDevtoolsPluginModule.forRoot(),
        QuillModule.forRoot({
            modules: {
                clipboard: {
                    matchVisual: false,
                },
            },
        })], providers: [
        AuthGuard,
        {
            provide: APP_INITIALIZER,
            useFactory: configLoader,
            deps: [Injector],
            multi: true,
        },
        EditorService,
        MetabolightsService,
        EuropePMCService,
        DOIService,
        AuthService,
        LabsWorkspaceService,
        { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: DescriptorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: FactorInterceptor, multi: true },
        {
            provide: APP_BASE_HREF,
            useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {
  constructor(
  ) {
    
  }
}

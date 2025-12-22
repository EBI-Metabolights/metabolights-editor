import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../shared/shared.module";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { GuidedAssaysComponent } from "./assays/assays.component";
import { CreateComponent } from "./create/create.component";
import { InfoComponent } from "./info/info.component";
import { MetaComponent } from "./meta/meta.component";
import { ProgressComponent } from "./progress/progress.component";
import { RawUploadComponent } from "./upload/upload.component";
import { StudyModule } from "../study/study.module";
import { RouterModule } from "@angular/router";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({ declarations: [
        GuidedAssaysComponent,
        CreateComponent,
        InfoComponent,
        MetaComponent,
        ProgressComponent,
        RawUploadComponent,
    ],
    exports: [
        GuidedAssaysComponent,
        CreateComponent,
        InfoComponent,
        MetaComponent,
        ProgressComponent,
        RawUploadComponent,
    ], imports: [CommonModule,
        BrowserModule,
        MatIconModule,
        FormsModule,
        SharedModule,
        StudyModule, // TODO: move the components we need for this GuideModule from StudyModule into Shared.
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatOptionModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatInputModule,
        MatAutocompleteModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class GuideModule {}

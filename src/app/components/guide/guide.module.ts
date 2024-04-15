import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatLegacyOptionModule as MatOptionModule } from "@angular/material/legacy-core";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AngularStickyThingsModule } from "@w11k/angular-sticky-things";
import { SharedModule } from "../shared/shared.module";
import { GuidedAssaysComponent } from "./assays/assays.component";
import { CreateComponent } from "./create/create.component";
import { InfoComponent } from "./info/info.component";
import { MetaComponent } from "./meta/meta.component";
import { ProgressComponent } from "./progress/progress.component";
import { RawUploadComponent } from "./upload/upload.component";

@NgModule({
  declarations: [
    GuidedAssaysComponent,
    CreateComponent,
    InfoComponent,
    MetaComponent,
    ProgressComponent,
    RawUploadComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    MatIconModule,
    FormsModule,
    SharedModule,
    //StudyModule, // TODO: move the components we need for this GuideModule from StudyModule into Shared.
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    AngularStickyThingsModule,
  ],
  exports: [
    GuidedAssaysComponent,
    CreateComponent,
    InfoComponent,
    MetaComponent,
    ProgressComponent,
    RawUploadComponent,
  ],
})
export class GuideModule {}

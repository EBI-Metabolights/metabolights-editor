import { NgReduxModule } from "@angular-redux/store";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "../shared/shared.module";
import { StudyModule } from "../study/study.module";
import { GuidedAssaysComponent } from "./assays/assays.component";
import { CreateComponent } from "./create/create.component";
import { InfoComponent } from "./info/info.component";
import { MetaComponent } from "./meta/meta.component"
import { ProgressComponent } from "./progress/progress.component";
import { RawUploadComponent } from "./upload/upload.component";


@NgModule({
    declarations: [
        GuidedAssaysComponent,
        CreateComponent,
        InfoComponent,
        MetaComponent,
        ProgressComponent,
        RawUploadComponent

    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MatIconModule,
        FormsModule,
        SharedModule,
        //StudyModule, // TODO: move the components we need for this GuideModule from StudyModule into Shared.
        ReactiveFormsModule,
        BrowserAnimationsModule,
        NgReduxModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatButtonToggleModule
    ],
    exports: [
        GuidedAssaysComponent,
        CreateComponent,
        InfoComponent,
        MetaComponent,
        ProgressComponent,
        RawUploadComponent

    ]
})
export class GuideModule {}
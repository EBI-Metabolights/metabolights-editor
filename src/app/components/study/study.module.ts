import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AssaysComponent } from "./assays/assays.component";
import { AssayDetailsComponent } from "./assays/assay-details/assay-details.component";
import { DeleteComponent } from "./delete/delete.component";
import { FactorsComponent } from "./factors/factors.component";
import { FactorComponent } from "./factors/factor/factor.component";
import { FilesComponent } from "./files/files.component";
import { MafsComponent } from "./mafs/mafs.component";
import { MafComponent } from "./mafs/maf/maf.component";
import { OrganismsComponent } from "./organisms/organisms.component";
import { OrganismComponent } from "./organisms/organism/organism.component";
import { ProtocolsComponent } from "./protocols/protocols.component";
import { ProtocolComponent } from "./protocols/protocol/protocol.component";
import { PublicationsComponent } from "./publications/publications.component";
import { PublicationComponent } from "./publications/publication/publication.component";
import { ReleaseDateComponent } from "./release-date/release-date.component";
import { SamplesComponent } from "./samples/samples.component";
import { StatusComponent } from "./status/status.component";
import { ValidationsComponent } from "./validations/validations.component";
import { ValidationDetailComponent } from "./validations/validation-detail/validation-detail.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatCommonModule } from "@angular/material/core";
import { MatLegacyOptionModule as MatOptionModule } from "@angular/material/legacy-core";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { SharedModule } from "../shared/shared.module";
import { HttpClientModule } from "@angular/common/http";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { ValidationDetailCommentComponent } from "./validations/validation-detail/comment/validation-detail-comment.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { QuillModule } from "ngx-quill";
import { AuthGuard } from "src/app/auth-guard.service";
import { EditorService } from "src/app/services/editor.service";
import { AuthService } from "src/app/services/metabolights/auth.service";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { DOIService } from "src/app/services/publications/doi.service";
import { EuropePMCService } from "src/app/services/publications/europePMC.service";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { RsyncStatusTransformPipe } from "./files/rsync/rsync-status-transform.pipe";
import { AngularStickyThingsModule } from "@w11k/angular-sticky-things";
import { RsyncComponent } from './files/rsync/rsync.component';
import { ValidationStatusTransformPipe } from "./validations/validation-status-transform.pipe";

@NgModule({
  declarations: [
    AssaysComponent,
    AssayDetailsComponent,
    DeleteComponent,
    FactorsComponent,
    FactorComponent,
    FilesComponent,
    MafsComponent,
    MafComponent,
    OrganismsComponent,
    OrganismComponent,
    ProtocolsComponent,
    ProtocolComponent,
    PublicationsComponent,
    PublicationComponent,
    ReleaseDateComponent,
    SamplesComponent,
    StatusComponent,
    ValidationsComponent,
    ValidationDetailComponent,
    ValidationDetailCommentComponent,
    RsyncStatusTransformPipe,
    ValidationStatusTransformPipe,
    RsyncComponent
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
    MatTableModule,
    MatCommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    SharedModule,
    MatButtonModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    QuillModule,
    MatCheckboxModule,
    AngularStickyThingsModule
  ],
  exports: [
    AssaysComponent,
    AssayDetailsComponent,
    DeleteComponent,
    FactorsComponent,
    FactorComponent,
    FilesComponent,
    MafsComponent,
    MafComponent,
    OrganismsComponent,
    OrganismComponent,
    ProtocolsComponent,
    ProtocolComponent,
    PublicationsComponent,
    PublicationComponent,
    ReleaseDateComponent,
    SamplesComponent,
    StatusComponent,
    ValidationsComponent,
    ValidationDetailComponent,
    ValidationDetailCommentComponent
  ],
  providers: [
    AuthGuard,
    EditorService,
    MetabolightsService,
    EuropePMCService,
    DOIService,
    AuthService,
  ],
})
export class StudyModule {}

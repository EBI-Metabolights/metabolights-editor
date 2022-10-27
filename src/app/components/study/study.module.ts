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
import { NgReduxModule } from "@angular-redux/store";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatCommonModule, MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { SharedModule } from "../shared/shared.module";
import { HttpClientModule } from "@angular/common/http";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { ValidationDetailCommentComponent } from "./validations/validation-detail/comment/validation-detail-comment.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { QuillModule } from "ngx-quill";
import { AuthGuard } from "src/app/auth-guard.service";
import { EditorService } from "src/app/services/editor.service";
import { AuthService } from "src/app/services/metabolights/auth.service";
import { MetabolightsService } from "src/app/services/metabolights/metabolights.service";
import { DOIService } from "src/app/services/publications/doi.service";
import { EuropePMCService } from "src/app/services/publications/europePMC.service";
import { MatCheckboxModule } from "@angular/material/checkbox";

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
    NgReduxModule,
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
    ValidationDetailCommentComponent,
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

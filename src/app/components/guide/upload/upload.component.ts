import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "../../../store";
import { MTBLSPerson } from "./../../../models/mtbl/mtbls/mtbls-person";
import { Ontology } from "./../../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSPublication } from "./../../../models/mtbl/mtbls/mtbls-publication";
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript";
import * as toastr from "toastr";
import { Router } from "@angular/router";

import { EditorService } from "./../../../services/editor.service";
import { environment } from "src/environments/environment";
import { PlatformLocation } from "@angular/common";
import { UserState } from "src/app/ngxs-store/user.state";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/user.actions";
import { Select } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata.state";

@Component({
  selector: "raw-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.css"],
})
export class RawUploadComponent implements OnInit {
  @select((state) => state.status.user) studyUser;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.files) studyFiles;

  @Select(UserState.user) user$: Observable<Owner>;
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>


  user: any = null;
  requestedStudy: string = null;
  files: any = {};
  isLoading = false;
  baseHref: string;
  constructor(
    private ngRedux: NgRedux<IAppState>,
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService,
    private platformLocation: PlatformLocation
  ) {
    this.editorService.initialiseStudy(this.route);
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
    
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  setUpSubscriptions() {
    this.studyUser.subscribe((value) => {
      this.user = value;
      this.user.checked = true;
    });
    this.studyIdentifier.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.studyFiles.subscribe((value) => {
      this.files = value;
    });
  }

  setUpSubscriptionsNgxs() {
    this.user$.subscribe((value) => {
      this.user = value;
      this.user.checked = true;
    });
    this.studyIdentifier$.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.studyFiles.subscribe((value) => {
      this.files = value;
    });
  }

  ngOnInit() {}

  isFolder(file) {
    return file.directory;
  }

  refreshFiles() {
    this.editorService.loadStudyFiles(true);
  }

  copyFilesAndProceed() {
    this.isLoading = true;
    this.editorService.syncStudyFiles({ files: [] }).subscribe((resp) => {
      this.isLoading = false;
      this.router.navigate(["/guide/meta", this.requestedStudy]);
    });
  }
}

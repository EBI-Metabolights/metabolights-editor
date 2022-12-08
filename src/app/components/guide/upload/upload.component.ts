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
import { Store } from "@ngrx/store";
import { selectUser } from "src/app/state/user.selectors";

@Component({
  selector: "raw-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.css"],
})
export class RawUploadComponent implements OnInit {
  //old state
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.files) studyFiles;

  //new state
  user$ = this.store.select(selectUser)

  user: any = null;
  requestedStudy: string = null;
  files: any = {};
  isLoading = false;

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService,
    private store: Store
  ) {
    this.editorService.initialiseStudy(this.route);
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {

    this.studyIdentifier.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.studyFiles.subscribe((value) => {
      this.files = value;
    });

    this.user$.subscribe(user => {
      this.user = user;
    })
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

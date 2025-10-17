import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { EditorService } from "./../../../services/editor.service";
import { PlatformLocation } from "@angular/common";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { Observable } from "rxjs";
import { Owner } from "src/app/ngxs-store/non-study/user/user.actions";
import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { Operations } from "src/app/ngxs-store/study/files/files.actions";

@Component({
    selector: "raw-upload",
    templateUrl: "./upload.component.html",
    styleUrls: ["./upload.component.css"],
    standalone: false
})
export class RawUploadComponent implements OnInit {

  user$: Observable<Owner> = inject(Store).select(UserState.user);
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);



  user: any = null;
  requestedStudy: string = null;
  files: any = {};
  isLoading = false;
  baseHref: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService,
    private platformLocation: PlatformLocation,
    private store: Store
  ) {
    this.editorService.initialiseStudy(this.route);

    this.setUpSubscriptionsNgxs();
    
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }

  setUpSubscriptionsNgxs() {
    this.user$.subscribe((value) => {
      this.user = value;
      this.user.checked = true;
    });
    this.studyIdentifier$.subscribe((value) => {
      this.requestedStudy = value;
    });
    this.studyFiles$.subscribe((value) => {
      this.files = value;
    });
  }

  ngOnInit() {}

  isFolder(file) {
    return file.directory;
  }

  refreshFiles() {
    this.store.dispatch(new Operations.GetFreshFilesList(true, false, this.requestedStudy));
  }

  copyFilesAndProceed() {
    this.isLoading = true;
    this.editorService.syncStudyFiles({ files: [] }).subscribe((resp) => {
      this.isLoading = false;
      this.router.navigate(["/guide/meta", this.requestedStudy]);
    });
  }
}

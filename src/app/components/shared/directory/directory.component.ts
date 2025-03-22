import { Component, OnInit, Input, Output, EventEmitter, inject } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
@Component({
  selector: "mtbls-directory",
  templateUrl: "./directory.component.html",
  styleUrls: ["./directory.component.css"],
})
export class DirectoryComponent implements OnInit {
  @Input("file") file: StudyFile;
  @Input("level") level: any;
  @Input("parent") parent: any;
  @Input("parentDirectoryComponent") parentDirectoryComponent: DirectoryComponent = null;
  @Input("collapse") collapse = false;
  @Input("deletionEnabled") deletionEnabled = true;
  @Input("downloadEnabled") downloadEnabled = true;
  @Input("downloadContents") downloadContents = true;
  @Input("readonlyFolder") readonlyFolder = false;
  @Input("showReferencedFiles") showReferencedFiles = false;
  @Input("location") location = null;
  @Input("managedFolders") managedFolders = [];


  @Output() fileDeleted = new EventEmitter<any>();

  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);

  selectedMetaFiles: any[] = [];
  selectedRawFiles: any[] = [];
  selectedAuditFiles: any[] = [];
  selectedDerivedFiles: any[] = [];
  selectedUploadFiles: any[] = [];

  isReadOnly = false;
  curator = false;

  baseHref: string;
  constructor(private editorService: EditorService) {
    this.baseHref =this.editorService.configService.baseHref;
  }

  ngOnInit() {
    this.setUpSubscriptionNgxs();

  }

  setUpSubscriptionNgxs() {
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
    this.isCurator$.subscribe((value) => {
      if (value != null) {
        this.curator = value;
      }
    })

  }

  isFolder(file) {
    return file.directory;
  }


  handleDeletedFile($event) {
    if ($event.parentDirectoryComponent != null){
      const files = $event.parentDirectoryComponent.file.files;
      const newFiles = [];
      files.forEach(d => d.file !== $event.file.file ? newFiles.push(Object.assign({}, d)): true);

      $event.parentDirectoryComponent.file.files = newFiles;
    } else {
      this.fileDeleted.emit($event);
    }

  }

  expandDirectory(directory) {
    if (this.isFolder(directory)) {
      if (directory.files) {
        delete directory.files;
      } else {
        this.editorService
          .loadStudyDirectoryFromLocation(directory, this.parent, this.location)
          .subscribe((data) => {
            directory.files = data.study;
          });
      }
    }
  }

  childDirectoryDeletionEnabled(file): boolean {
    if (!this.curator && this.file.type === 'audit') return false
    return !this.readonlyFolder
  }

  isManagedFolder(path){
    return this.managedFolders.includes(path);
  }

  isChecked(filename, category) {
    let isFileChecked = false;
    if (category === "raw") {
      this.selectedRawFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "audit") {
      this.selectedAuditFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "derived") {
      this.selectedDerivedFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "upload") {
      this.selectedUploadFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    } else if (category === "meta") {
      this.selectedMetaFiles.forEach((f) => {
        if (f.file === filename) {
          isFileChecked = true;
        }
      });
    }
    return isFileChecked;
  }
}

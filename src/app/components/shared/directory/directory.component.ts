import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
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
  @Input("readonlyFolder") readonlyFolder = false;

  @Output() fileDeleted = new EventEmitter<any>();

  @select((state) => state.study.readonly) readonly;

  selectedMetaFiles: any[] = [];
  selectedRawFiles: any[] = [];
  selectedAuditFiles: any[] = [];
  selectedDerivedFiles: any[] = [];
  selectedUploadFiles: any[] = [];

  isReadOnly = false;
  baseHref: string;
  constructor(private editorService: EditorService) {
    this.baseHref =this.editorService.configService.baseHref;
  }

  ngOnInit() {
    this.setUpSubscription();
    // if (this.collapse){
    //   this.expandDirectory(this.file);
    // }
  }

  setUpSubscription() {
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
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
          .loadStudyDirectory(directory, this.parent)
          .subscribe((data) => {
            directory.files = data.study;
          });
      }
    }
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

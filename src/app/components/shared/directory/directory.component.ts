import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { EditorService } from "../../../services/editor.service";
import { NgRedux, select } from "@angular-redux/store";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-directory",
  templateUrl: "./directory.component.html",
  styleUrls: ["./directory.component.css"],
})
export class DirectoryComponent implements OnInit {
  @Input("file") file: any;
  @Input("parent") parent: any;
  @Input("level") level: any;

  selectedMetaFiles: any[] = [];
  selectedRawFiles: any[] = [];
  selectedAuditFiles: any[] = [];
  selectedDerivedFiles: any[] = [];
  selectedUploadFiles: any[] = [];

  @select((state) => state.study.readonly) readonly;
  isReadOnly: boolean = false;

  constructor(private editorService: EditorService) {}

  @Output() fileDeleted = new EventEmitter<any>();

  ngOnInit() {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
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

  emitFileDeleted() {
    this.fileDeleted.emit();
  }

  expandDirectory(directory) {
    if (this.isFolder(directory)) {
      if (directory.files) {
        delete directory["files"];
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
    if (category == "raw") {
      this.selectedRawFiles.forEach((f) => {
        if (f.file == filename) {
          isFileChecked = true;
        }
      });
    } else if (category == "audit") {
      this.selectedAuditFiles.forEach((f) => {
        if (f.file == filename) {
          isFileChecked = true;
        }
      });
    } else if (category == "derived") {
      this.selectedDerivedFiles.forEach((f) => {
        if (f.file == filename) {
          isFileChecked = true;
        }
      });
    } else if (category == "upload") {
      this.selectedUploadFiles.forEach((f) => {
        if (f.file == filename) {
          isFileChecked = true;
        }
      });
    } else if (category == "meta") {
      this.selectedMetaFiles.forEach((f) => {
        if (f.file == filename) {
          isFileChecked = true;
        }
      });
    }
    return isFileChecked;
  }
}

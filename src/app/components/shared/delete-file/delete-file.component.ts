import { Component, OnInit, Input, Output, EventEmitter, inject } from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import * as toastr from "toastr";
import { UntypedFormBuilder } from "@angular/forms";
import { EditorService } from "../../../services/editor.service";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { DirectoryComponent } from "../directory/directory.component";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";

@Component({
  selector: "mtbls-file-delete",
  templateUrl: "./delete-file.component.html",
  styleUrls: ["./delete-file.component.css"],
})
export class DeleteFileComponent implements OnInit {
  @Input("value") file: string;
  @Input("type") type: string;
  @Input("fileLocation") fileLocation = "study";

  @Input("parentDirectoryComponent") parentDirectoryComponent: DirectoryComponent;
  @Input("file") studyFile: StudyFile;

  obfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);
  
  @Output() fileDeleted = new EventEmitter<{file: StudyFile; parentDirectoryComponent: DirectoryComponent}>();
  inProgress = false;
  code = "";
  isDeleteModalOpen = false;
  forceMetaDataDelete = false;

  constructor(
    private editorService: EditorService
  ) {

    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.obfuscationCode$.subscribe((value) => {
      this.code = value;
    });
  }


  ngOnInit() {}

  confirmDelete() {
    this.forceMetaDataDelete = false;
    this.isDeleteModalOpen = true;
  }

  closeDeleteConfirmation() {
    this.isDeleteModalOpen = false;
  }


  // needs state refactor
  deleteSelected() {
    if (this.inProgress) {
      return;
    }
    this.inProgress = true;
    this.editorService
      .deleteStudyFiles(
        null,
        this.compileBody([this.file]),
        this.fileLocation,
        this.forceMetaDataDelete
      )
      .subscribe((data) => {
        if (data.errors.length === 0) {
          toastr.success("File is deleted successfully", "Success", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
          this.fileDeleted.emit({file: this.studyFile, parentDirectoryComponent: this.parentDirectoryComponent});
        } else {
          const item = data.errors[0];
          toastr.error(item.message, "Error", {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          });
        }
        this.inProgress = false;
        this.closeDeleteConfirmation();
      },
      (err) => {
        this.inProgress = false;
        this.closeDeleteConfirmation();
      }
      );
  }

  compileBody(filesList) {
    const files = [];
    filesList.forEach((f) => {
      files.push({ name: f });
    });
    return { files };
  }
}

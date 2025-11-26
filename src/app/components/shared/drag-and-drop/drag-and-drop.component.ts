import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { GeneralMetadataState } from 'src/app/ngxs-store/study/general-metadata/general-metadata.state';
import { FilesService } from 'src/app/services/decomposed/files.service';

interface UploadFile {
  error: any;
  file: File;
  name: string;
  size: number;
  progress: number; // 0 to 100
}

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.css'],
})
export class DragAndDropComponent implements OnInit  {
  @Input() iscloseable: Boolean = false;
  @Input() filePatternString: string ="^([asi]_.+\.txt|m_.+\.tsv)$";
  @Output() closeUpload = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<UploadFile[]>();

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

  files: UploadFile[] = [];
  isDragOver = false;
  uploading = false;

  // Max file size 50MB
  readonly maxFileSize = 50 * 1024 * 1024;
  studyId: any;

  constructor(private filesService: FilesService){}

  ngOnInit() {
    this.setUpSubscriptionNgxs();
  }

  setUpSubscriptionNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.studyId = value;
      }
    });
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
      input.value = ''; // reset input
    }
  }

  addFiles(fileList: FileList) {
    const pattern = new RegExp(this.filePatternString);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (file) {
        if (file.size > this.maxFileSize) {
          Swal.fire('File Too Large', `File "${file.name}" exceeds the 50MB size limit and will be skipped.`, 'error');
          continue;
        }
        if (!pattern.test(file.name)) {
          Swal.fire('Invalid File', `File "${file.name}" does not match the required pattern and will be skipped.`, 'error');
          continue;
        }
        if( file.name.trim() !== "i_Investigation.txt" && file.name.indexOf(this.studyId) === -1){
          Swal.fire('Invalid File', `File "${file.name}" does not contain the study identifier "${this.studyId}" and will be skipped.`, 'error');
          continue;
        }
        if (this.files.find(f => f.name === file.name && f.size === file.size)) {
          // Skip duplicates
          continue;
        }
        this.files.push({
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          error: undefined
        });
      }
    }
  }

  removeFile(index: number) {
    if (this.uploading && this.files[index].progress > 0 && this.files[index].progress < 100) {
      // Prevent removing files currently uploading
      return;
    }
    this.files.splice(index, 1);
  }

uploadFiles() {
  if (this.uploading || this.files.length === 0) {
    return;
  }
  this.uploading = true;

  // Call prerequisite API once before uploading all files
  this.filesService.createAuditFolder(this.studyId).subscribe({
    next: () => {
      // Prerequisite succeeded, proceed with uploading all files
      const uploadPromises = this.files.map(file => {
        return new Promise<void>((resolve, reject) => {
          this.filesService.uploadFile(this.studyId, file.file).subscribe({
            next: (progress) => {
              file.progress = progress.progress;
              if (progress.success) {
                resolve();
              }
            },
            error: (err) => {
              file.error = err.error?.error || 'Upload failed';
              reject(err);
            }
          });
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          this.uploading = false;
          this.uploadComplete.emit(this.files);
          // Optionally clear files after upload:
          // this.files = [];
        })
        .catch(() => {
          this.uploading = false;
          // Optionally handle overall upload failure here
        });
    },
    error: (err) => {
      // Prerequisite API failed, do not upload files
      this.uploading = false;
      // Optionally set error state or notify user
      console.error('Prerequisite check failed:', err);
      // You can also emit an event or show a message here
    }
  });
}

}
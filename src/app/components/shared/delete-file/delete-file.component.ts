import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { NgRedux, select } from '@angular-redux/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditorService } from '../../../services/editor.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mtbls-file-delete',
  templateUrl: './delete-file.component.html',
  styleUrls: ['./delete-file.component.css'],
})
export class DeleteFileComponent implements OnInit {
  @Input('value') file: string;
  @Input('type') type: string;
  @select((state) => state.study.obfuscationCode) obfuscationCode;
  @Output() fileDeleted = new EventEmitter<any>();

  code = '';
  isDeleteModalOpen = false;
  fileLocation = '';
  forceMetaDataDelete = false;

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService,
    private editorService: EditorService
  ) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.obfuscationCode.subscribe((value) => {
      this.code = value;
    });
  }

  ngOnInit() {}

  confirmDelete() {
    this.forceMetaDataDelete = false;
    this.fileLocation = 'study';
    this.isDeleteModalOpen = true;
  }

  closeDeleteConfirmation() {
    this.isDeleteModalOpen = false;
  }

  deleteSelected() {
    this.editorService
      .deleteStudyFiles(
        null,
        this.compileBody([this.file]),
        this.fileLocation,
        this.forceMetaDataDelete
      )
      .subscribe((data) => {
        this.fileDeleted.emit(this.file);
        this.closeDeleteConfirmation();
      });
  }

  compileBody(filesList) {
    const files = [];
    filesList.forEach((f) => {
      files.push({ name: f });
    });
    return { files };
  }
}

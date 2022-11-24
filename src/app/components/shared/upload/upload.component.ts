import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder } from "@angular/forms";

@Component({
  selector: "mtbls-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.css"],
})
export class UploadComponent implements OnInit {
  @Input("mode") mode = "button";
  @Input("size") size = "is-small";

  @Input("file") file: string = null;
  @Input("multiple") allowMultipleSelection = true;
  @Input("type") type = "file";
  @Input("fileTypes") fileTypes: any = {
    filter_name: "All types", // eslint-disable-line @typescript-eslint/naming-convention
    extensions: ["*"],
  };

  @Output() complete = new EventEmitter<any>(); // eslint-disable-line @angular-eslint/no-output-native
  isUploadModalOpen = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}

  uploadComplete() {
    this.complete.emit();
    this.closeUploadModal();
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }
}

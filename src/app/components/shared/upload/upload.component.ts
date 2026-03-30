import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

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
  @Output() scrollRequested = new EventEmitter<void>();

  isUploadModalOpen = false;
  selectedMethod: 'aspera' | 'browser' | 'ftp' | null = null;
  selectedFtpCategory: any = null;
  showAsperaHelp = false;

  categories = [
    { id: 'metadata', label: 'Metadata/Result', directory: '' },
    { id: 'raw', label: 'Raw Data', directory: '/RAW_FILES' },
    { id: 'derived', label: 'Derived Data', directory: '/DERIVED_FILES' },
    { id: 'supplementary', label: 'Supplementary', directory: '/SUPPLEMENTARY_FILES' }
  ];

  constructor(private fb: UntypedFormBuilder) { }

  ngOnInit() { }

  selectMethod(method: 'aspera' | 'browser' | 'ftp') {
    if (method === 'browser') {
      this.closeUploadModal();
      this.scrollRequested.emit();
    } else {
      this.selectedMethod = method;
      if (method === 'ftp') {
        this.selectedFtpCategory = this.categories[0];
      }
    }
  }

  selectFtpCategory(category: any) {
    this.selectedFtpCategory = category;
  }

  toggleAsperaHelp() {
    this.showAsperaHelp = !this.showAsperaHelp;
  }

  resetSelection() {
    this.selectedMethod = null;
    this.showAsperaHelp = false;
  }

  uploadComplete() {
    this.complete.emit();
    this.closeUploadModal();
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
    this.resetSelection();
  }
}

import { Component, inject, OnInit } from "@angular/core";
import { MetabolightsService } from "../../../../services/metabolights/metabolights.service";
import { UntypedFormBuilder } from "@angular/forms";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";


 export interface FtpDetails {
  user: string;
  secret: string;
  server: string
}

@Component({
  selector: "mtbls-ftp",
  templateUrl: "./ftp.component.html",
  styleUrls: ["./ftp.component.css"],
})
export class FTPUploadComponent implements OnInit {

  uploadLocation$: Observable<string> = inject(Store).select(FilesState.uploadLocation);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.studyRules);

  rules: Record<string, any> = null;
  details: FtpDetails = {
    user: "",
    secret: "",
    server: ""
  }

  isFTPUploadModalOpen = false;

  validationsId = "upload";
  displayHelpModal = false;

  uploadPath = "";


  constructor(
    private fb: UntypedFormBuilder,
    private metabolightsService: MetabolightsService
  ) {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.uploadLocation$.subscribe((value) => {
      this.uploadPath = value;
    });
    this.editorValidationRules$.subscribe((rules) => {
      if (rules !== null && rules !== undefined) {
        this.details = {
          user: rules[this.validationsId]["ftp"]["user"],
          secret: rules[this.validationsId]["ftp"]["secret"],
          server: rules[this.validationsId]["ftp"]["server"]
        }
      }
    })
  }

  toggleHelp() {
    this.displayHelpModal = !this.displayHelpModal;
  }

  ngOnInit() {}

  openUploadModal() {
    this.isFTPUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isFTPUploadModalOpen = false;
  }
}

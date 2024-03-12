import { Component, OnInit } from "@angular/core";
import { MetabolightsService } from "../../../../services/metabolights/metabolights.service";
import { NgRedux, select } from "@angular-redux/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Select } from "@ngxs/store";
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
  @select((state) => state.study.uploadLocation) uploadLocation;
  @select((state) => state.study.validations) validations: any;

  @Select(FilesState.uploadLocation) uploadLocation$: Observable<string>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;

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
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService
  ) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscription();
    }
    if (environment.useNewState) this.setUpSubscriptionNgxs();
  }

  setUpSubscription() {
    this.uploadLocation.subscribe((value) => {
      this.uploadPath = value;
    });
    this.validations.subscribe((rules) => { this.rules = rules})
  }

  setUpSubscriptionNgxs() {
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

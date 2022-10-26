import { Component, OnInit } from "@angular/core";
import { MetabolightsService } from "../../../../services/metabolights/metabolights.service";
import { NgRedux, select } from "@angular-redux/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-ftp",
  templateUrl: "./ftp.component.html",
  styleUrls: ["./ftp.component.css"],
})
export class FTPUploadComponent implements OnInit {
  @select((state) => state.study.uploadLocation) uploadLocation;
  @select((state) => state.study.validations) validations: any;

  isFTPUploadModalOpen = false;

  validationsId = "upload";
  displayHelpModal = false;

  uploadPath = "";

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService
  ) {
    if (!environment.isTesting) {
      this.setUpSubscription();
    }
  }

  setUpSubscription() {
    this.uploadLocation.subscribe((value) => {
      this.uploadPath = value;
    });
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

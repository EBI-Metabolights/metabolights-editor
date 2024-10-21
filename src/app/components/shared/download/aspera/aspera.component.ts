import { Component, OnInit, Output, EventEmitter, inject } from "@angular/core";
import { PlatformLocation } from "@angular/common";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
declare let AW4: any;
/* eslint-disable @typescript-eslint/naming-convention */
@Component({
  selector: "mtbls-download-aspera",
  templateUrl: "./aspera.component.html",
  styleUrls: ["./aspera.component.css"],
})
export class AsperaDownloadComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);


  @Output() complete = new EventEmitter<any>(); // eslint-disable-line @angular-eslint/no-output-native

  displayHelpModal = false;
  studyId: string = null;
  isAsperaDownloadModalOpen = false;
  selectedTab = "plugin";
  file = null;
  allowMultipleSelection = false;
  type = "file";
  requestedStudy = null;
  fileTypes = null;
  currentTransferId = null;
  validationsId = "download";
  MIN_CONNECT_VERSION = "3.6.0.0";
  CONNECT_AUTOINSTALL_LOCATION = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
  downloadPath = "";
  validation: any = null;
  asperaWeb: any = null;
  baseHref: any;

  constructor(private platformLocation: PlatformLocation) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
  }
  ngOnInit() {
    this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validation = value[this.validationsId];
    });
  }


  toggleHelp() {
    this.displayHelpModal = !this.displayHelpModal;
  }

  changeTab(n) {
    this.selectedTab = n;
  }

  openDownloadModal() {
    this.isAsperaDownloadModalOpen = true;
  }

  closeDownloadModal() {
    this.isAsperaDownloadModalOpen = false;
  }

  download() {
    this.asperaDownload();
  }

  asperaDownload() {
    this.asperaWeb = new AW4.Connect({
      sdkLocation: this.CONNECT_AUTOINSTALL_LOCATION,
      minVersion: this.MIN_CONNECT_VERSION,
    });
    const t = new AW4.ConnectInstaller({
      sdkLocation: this.CONNECT_AUTOINSTALL_LOCATION,
    });
    this.asperaWeb.initSession();
    this.downloadFile();
  }

  downloadFile() {
    this.asperaWeb.startTransfer(
      {
        paths: [
          {
            source: "/studies/public/" + this.requestedStudy,
          },
        ],
        remote_host: "fasp.ebi.ac.uk",
        remote_user: "fasp-ml",
        remote_password: "Xz68YfDe",
        direction: "receive",
        target_rate_kbps: 5e4,
        allow_dialogs: !0,
        ssh_port: 33001,
        resume: "sparse_checksum",
      },
      {}
    );
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import { EditorService } from "../../../../services/editor.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MetabolightsService } from "../../../../services/metabolights/metabolights.service";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";
import { uptime } from "process";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Observable } from "rxjs";
import { Select } from "@ngxs/store";
import { ValidationState } from "src/app/ngxs-store/study/validation/validation.state";
declare let AW4: any;

/* the aspera code here is such a mystery that I'm afraid to tinker with it, so I'm disabling basically
 * all the linting rules that flag up. */

/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable space-before-function-paren */
@Component({
  selector: "mtbls-aspera",
  templateUrl: "./aspera.component.html",
  styleUrls: ["./aspera.component.css"],
})
export class AsperaUploadComponent implements OnInit {
  @select((state) => state.study.uploadLocation) uploadLocation;
  @select((state) => state.study.validations) validations: any;

  @Select(FilesState.obfuscationCode) uploadLocation$: Observable<string>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;


  @Input("type") type = "file";
  @Input("allowMultipleSelection") allowMultipleSelection = false;
  @Input("fileTypes") fileTypes: any = {
    filter_name: "All types",
    extensions: ["*"],
  };
  @Input("file") file: any = null;
  @Output() complete = new EventEmitter<any>(); // eslint-disable-line @angular-eslint/no-output-native

  isAsperaUploadModalOpen = false;
  selectedTab = "plugin";
  displayHelpModal = false;
  currentTransferId = null;
  validationsId = "upload";
  MIN_CONNECT_VERSION = "3.6.0.0";
  CONNECT_AUTOINSTALL_LOCATION = "//d3gcli72yxqn2z.cloudfront.net/connect/v4";
  uploadPath = "";
  asperaWeb: any = null;
  validation: any = null;
  videoURL: string;

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService,
    private editorService: EditorService,
    private configService: ConfigurationService
  ) {}

  setUpSubscriptions() {
    this.uploadLocation.subscribe((value) => {
      this.uploadPath = value;
    });
    this.validations.subscribe((value) => {
      if (value) {
        this.validation = value[this.validationsId];
      }
    });
  }

  setUpSubscriptionsNgxs() {
    this.uploadLocation$.subscribe((value) => {
      this.uploadPath = value;
    });
    this.editorValidationRules$.subscribe((value) => {
      if (value) {
        this.validation = value[this.validationsId];
      }
    });
  }

  ngOnInit() {
    this.videoURL = this.configService.config.videoURL.aspera;
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  toggleHelp() {
    this.displayHelpModal = !this.displayHelpModal;
  }

  changeTab(t) {
    this.selectedTab = t;
  }

  openUploadModal() {
    this.isAsperaUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isAsperaUploadModalOpen = false;
  }

  upload(t) {
    this.asperaUpload(t);
  }

  asperaUpload(t) {
    this.asperaWeb = new AW4.Connect({
      sdkLocation: this.CONNECT_AUTOINSTALL_LOCATION,
      minVersion: this.MIN_CONNECT_VERSION,
    });

    const asperaInstaller = new AW4.ConnectInstaller({
      sdkLocation: this.CONNECT_AUTOINSTALL_LOCATION,
    });

    const transferListener = (eventType, data) => {
      if (eventType === AW4.Connect.EVENT.TRANSFER) {
        data.transfers.forEach((transfer) => {
          transfer.uuid === this.currentTransferId &&
            "completed" === t.status &&
            (console.log("Upload completed"),
            console.log("Sync started"),
            this.allowMultipleSelection
              ? this.editorService
                  .syncStudyFiles({
                    files: [],
                  })
                  .subscribe(function (t) {
                    this.closeUploadModal(),
                      this.complete.emit(),
                      console.log("Sync complete");
                  })
              : this.editorService
                  .syncStudyFiles({
                    files: [
                      {
                        from: t.transfer_spec.paths[0].source
                          .split("\\")
                          .pop()
                          .split("/")
                          .pop(),
                        to: this.file,
                      },
                    ],
                  })
                  .subscribe((t) => {
                    this.closeUploadModal(),
                      this.complete.emit(),
                      console.log("Sync complete");
                  }));
        });
      }
    };

    const statusEventListener = function (eventType, data) {
      if (
        eventType === AW4.Connect.EVENT.STATUS &&
        data === AW4.Connect.STATUS.INITIALIZING
      ) {
        asperaInstaller.showLaunching();
      } else if (
        eventType === AW4.Connect.EVENT.STATUS &&
        data === AW4.Connect.STATUS.FAILED
      ) {
        asperaInstaller.showDownload();
      } else if (
        eventType === AW4.Connect.EVENT.STATUS &&
        data === AW4.Connect.STATUS.OUTDATED
      ) {
        asperaInstaller.showUpdate();
      } else if (
        eventType === AW4.Connect.EVENT.STATUS &&
        data === AW4.Connect.STATUS.RUNNING
      ) {
        asperaInstaller.connected();
      }
    };
    this.asperaWeb.addEventListener(
      AW4.Connect.EVENT.STATUS,
      statusEventListener
    );
    this.asperaWeb.addEventListener(
      AW4.Connect.EVENT.TRANSFER,
      transferListener
    );
    this.asperaWeb.initSession(),
      "folder" === t
        ? this.asperaWeb.showSelectFolderDialog(
            {
              success: function (t) {
                this.buildUploadSpec(t);
              }.bind(this),
              error(t) {
                console.error(t);
              },
            },
            {
              allowMultipleSelection: this.allowMultipleSelection,
            }
          )
        : (console.log(this.fileTypes),
          this.asperaWeb.showSelectFileDialog(
            {
              success: function (t) {
                this.buildUploadSpec(t);
              }.bind(this),
              error(t) {
                console.error(t);
              },
            },
            {
              allowMultipleSelection: this.allowMultipleSelection,
              allowedFileTypes: this.fileTypes,
            }
          ));
  }

  buildUploadSpec(t) {
    const e = [
      {
        aspera_connect_settings: {
          allow_dialogs: !0,
          back_link: location.href,
        },
        transfer_spec: {},
      },
    ];

    const i = this.validation.aspera;

    const l = {};
    l["remote_user"] = i.user;
    l["remote_password"] = i.secret;
    l["remote_host"] = i.server;
    l["target_rate_kbps"] = 5000;
    l["min_rate_kbps"] = 0;
    l["lock_policy"] = false;
    l["lock_target_rate"] = false;
    l["direction"] = "send";
    l["lock_min_rate"] = false;
    l["rate_policy"] = "fair";
    l["cipher"] = "aes-128";
    l["ssh_port"] = 33001;

    (e[0].transfer_spec = l), (e[0].transfer_spec["paths"] = []);
    for (let o = t.dataTransfer.files, r = 0, u = o.length; r < u; r += 1) {
      const a = o[r].name || "";
      e[0].transfer_spec["paths"] || (e[0].transfer_spec["paths"] = []),
        e[0].transfer_spec["paths"].push({
          source: a,
          destination: "",
        });
    }
    e[0].transfer_spec["destination_root"] = this.uploadPath;
    const s = {};
    (s["transfer_specs"] = e),
      this.asperaWeb.startTransfers(s, {
        success: (t) => {
          (this.currentTransferId = t.transfer_specs[0].uuid),
            console.log("Upload Started");
        },
      });
  }
}

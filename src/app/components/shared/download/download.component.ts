import { Component, OnInit, Input, inject } from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { UntypedFormBuilder } from "@angular/forms";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Store } from "@ngxs/store";
import { firstValueFrom, Observable, tap } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ConfigurationService } from "src/app/configuration.service";
import { httpOptions } from "src/app/services/headers";
import { HttpClient } from "@angular/common/http";
import * as toastr from "toastr";

@Component({
  selector: "mtbls-download",
  templateUrl: "./download.component.html",
  styleUrls: ["./download.component.css"],
})
export class DownloadComponent implements OnInit {
  @Input("value") file: string;
  @Input("type") type: string;
  @Input("selectedMetaFiles") selectedMetaFiles: number;


  obfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);

  domain = "";
  code = "";
  studyStatus = ""
  constructor(
    private fb: UntypedFormBuilder,
    private metabolightsService: MetabolightsService,
    private configService: ConfigurationService,
    private http: HttpClient
  ) {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.obfuscationCode$.subscribe((value) => {
      this.code = value;
    });
    this.studyStatus$.subscribe((value) => {
      this.studyStatus = value;
    });
  }

  ngOnInit() { }

  async getDownloadLink() {

    let url = this.metabolightsService.url.baseURL + "/studies/" + this.metabolightsService.id + "/download"
    if (this.code) {
      url += "/" + this.code
    }

    let params = "?file=" + this.file
    url += params
    interface OneTimeTokenResponse {
      one_time_token: string;
    }
    const oneTimeTokenUrl = this.configService.config.metabolightsWSURL.baseURL + "/auth/create-onetime-token"
    if (this.studyStatus.toLowerCase() == "provisional") {
      this.http.get<OneTimeTokenResponse>(oneTimeTokenUrl, httpOptions).subscribe(
        {
          next: (response) => { window.open(url + "&passcode=" + response.one_time_token, '_blank'); },
          error: err => {
            toastr.error("Failed to create link for the study.", "Error", {
              timeOut: "5000",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            });
          }
        }
      )
    } else {
      window.open(url, '_blank');
    }
  }
  viewFile() {

    let url = this.metabolightsService.url.baseURL + "/studies/" + this.metabolightsService.id + "/download"
    if (this.code) {
      url += "/" + this.code
    }

    let params = "?file=" + this.file
    url += params
    interface OneTimeTokenResponse {
      one_time_token: string;
    }
    const oneTimeTokenUrl = this.configService.config.metabolightsWSURL.baseURL + "/auth/create-onetime-token"
    if (this.studyStatus.toLowerCase() == "provisional") {
      this.http.get<OneTimeTokenResponse>(oneTimeTokenUrl, httpOptions).subscribe(
        {
          next: (response) => { this.metabolightsService.openTextFileInNewTab(url + "&passcode=" + response.one_time_token); },
          error: err => {
            toastr.error("Failed to create link for the study.", "Error", {
              timeOut: "5000",
              positionClass: "toast-top-center",
              preventDuplicates: true,
              extendedTimeOut: 0,
              tapToDismiss: false,
            });
          }
        }
      )
    } else {
      this.metabolightsService.openTextFileInNewTab(url);
    }
  }

}

import { Component, OnInit, Input } from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { FormBuilder } from "@angular/forms";
import { environment } from "src/environments/environment";
import { FilesService } from "src/app/services/decomposed/files.service";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Select } from "@ngxs/store";
import { Observable } from "rxjs";
@Component({
  selector: "mtbls-download",
  templateUrl: "./download.component.html",
  styleUrls: ["./download.component.css"],
})
export class DownloadComponent implements OnInit {
  @Input("value") file: string;
  @Input("type") type: string;

  @Select(FilesState.obfuscationCode) obfuscationCode$: Observable<string>;

  domain = "";
  code = "";

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService
  ) {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.obfuscationCode$.subscribe((value) => {
      this.code = value;
    });
  }

  ngOnInit() {}

  getDownloadLink() {
    return this.metabolightsService.downloadLink(this.file, this.code);
  }
}

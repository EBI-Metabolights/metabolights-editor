import { Component, OnInit, Input, inject } from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { UntypedFormBuilder } from "@angular/forms";
import { FilesState } from "src/app/ngxs-store/study/files/files.state";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
@Component({
  selector: "mtbls-download",
  templateUrl: "./download.component.html",
  styleUrls: ["./download.component.css"],
})
export class DownloadComponent implements OnInit {
  @Input("value") file: string;
  @Input("type") type: string;

  obfuscationCode$: Observable<string> = inject(Store).select(FilesState.obfuscationCode);

  domain = "";
  code = "";

  constructor(
    private fb: UntypedFormBuilder,
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
    const link = this.metabolightsService.downloadLink(this.file, this.code);
    return link;
  }
}

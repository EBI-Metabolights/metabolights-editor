import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EditorService } from "./../../../services/editor.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { Select, Store } from "@ngxs/store";

@Component({
  selector: "app-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.css"],
})
export class InfoComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  
  user: any = null;
  requestedStudy: string = null;
  uploadFiles: any[] = [];
  isLoading = false;
  baseHref: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private editorService: EditorService
  ) {
    this.editorService.initialiseStudy(this.route);
    this.setUpSubscriptionsNgxs();
    this.baseHref = this.editorService.configService.baseHref;
  }


  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) this.requestedStudy = value
    })
  }


  ngOnInit() {}

  proceedToNextStep() {
    this.router.navigate(["/guide/upload", this.requestedStudy]);
  }
}

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Select } from "@ngxs/store";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";

@Component({
  selector: "mtbls-delete",
  templateUrl: "./delete.component.html",
  styleUrls: ["./delete.component.css"],
})
export class DeleteComponent implements OnInit {

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>
  @Select(GeneralMetadataState.status) studyStatus$: Observable<string>
  @Select(UserState.isCurator) isCurator$: Observable<boolean>




  isModalOpen = false;
  isFormBusy = false;
  status: string = null;
  curator = false;
  requestedStudy: string = null;
  reload = false;

  constructor(
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.setUpSubscriptionsNgxs();
  }


  setUpSubscriptionsNgxs() {
    this.studyStatus$.subscribe((value) => {
      if (value != null) {
        this.status = value;
      }
    });
    this.isCurator$.subscribe((value) => {
      if (value != null) {
        this.curator = value;
      }
    });
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
  }

  ngOnInit() {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  delete() {
    this.editorService.deleteStudy(this.requestedStudy).subscribe(
      (res) => {
        this.isModalOpen = false;
        this.router.navigate(["/console"], { queryParams: { reload: "true" } });
      },
      (err) => {
        this.isFormBusy = false;
      }
    );
  }
}

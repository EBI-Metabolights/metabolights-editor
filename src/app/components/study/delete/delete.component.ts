import { Component, OnInit } from "@angular/core";
import { select } from "@angular-redux/store";
import { ActivatedRoute, Router } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Component({
  selector: "mtbls-delete",
  templateUrl: "./delete.component.html",
  styleUrls: ["./delete.component.css"],
})
export class DeleteComponent implements OnInit {
  @select((state) => state.study.status) studyStatus;
  @select((state) => state.status.isCurator) isCurator;
  @select((state) => state.study.identifier) studyIdentifier;

  isModalOpen: boolean = false;
  isFormBusy: boolean = false;
  status: string = null;
  curator: boolean = false;
  requestedStudy: string = null;
  reload = false;

  constructor(
    private editorService: EditorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyStatus.subscribe((value) => {
      if (value != null) {
        this.status = value;
      }
    });
    this.isCurator.subscribe((value) => {
      if (value != null) {
        this.curator = value;
      }
    });
    this.studyIdentifier.subscribe((value) => {
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

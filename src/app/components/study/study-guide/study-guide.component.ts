import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { EditorService } from "src/app/services/editor.service";

@Component({
  selector: "app-study-guide",
  templateUrl: "./study-guide.component.html",
  styleUrls: ["./study-guide.component.css"],
})
export class StudyGuideComponent implements OnInit {
  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  requestedStudy: string = null;
  doneStepExpandedIndex = 0;

  constructor(private route: ActivatedRoute, private editorService: EditorService) {
      this.editorService.initialiseStudy(this.route);
  }

  ngOnInit(): void {
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) this.requestedStudy = value;
    });
  }

  toggleDoneStepExpand(index: number) {
    this.doneStepExpandedIndex = this.doneStepExpandedIndex === index ? -1 : index;
  }
}

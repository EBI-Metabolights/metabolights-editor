import {
  Component,
  inject,
  OnInit
} from "@angular/core";
import Swal from "sweetalert2";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { StudyReleaseDate } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-release-date",
  templateUrl: "./release-date.component.html",
  styleUrls: ["./release-date.component.css"],
})
export class ReleaseDateComponent implements OnInit {

  studyIdentifier$: Observable<string> = inject(Store).select(GeneralMetadataState.id);
  studyReleaseDate$: Observable<Date> = inject(Store).select(GeneralMetadataState.releaseDate);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  private toastrSettings: Record<string, any> = {};

  isReadOnly = false;

  isModalOpen = false;
  isFormBusy = false;
  requestedStudy: string = null;
  releaseDate: Date = null;


  constructor(private editorService: EditorService, private store: Store) {
    this.setUpSubscriptionsNgxs();
  }



  setUpSubscriptionsNgxs() {
    this.studyReleaseDate$.subscribe((value) => {
      if (value !== null) {
        if (value.toString() !== "") {
          this.releaseDate = value;
        } else {
          this.editorService.metaInfo().subscribe((response) => {
            this.releaseDate = response.data[1].split(":")[1];
            this.updateReleaseDateSilent(this.releaseDate);
          });
        }
      }
    });
    this.studyIdentifier$.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.readonly$.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
  }

  updateReleaseDateSilent(val) {
    if (!this.isReadOnly) {
      this.store.dispatch(new StudyReleaseDate.Update(val)).subscribe(
        (completed) => {

        },
        (error) => {
          console.log(
            "Release date missing in investigation file. Updated release date in investigation"
          );
        }
      )
    }
  }

  // ADJUST POST STATE MIGRATION
  updateReleaseDate(op, e) {
    if (!this.isReadOnly) {
      const selectedValue = new Date(e.value);
      const dateTo =
        selectedValue.getFullYear() +
        "-" +
        this.strPad(selectedValue.getMonth() + 1) +
        "-" +
        this.strPad(selectedValue.getDate());
      if (selectedValue != null) {
        Swal.fire({
          title:
            "Are you sure? Would you like to change your study release date to " +
            dateTo,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Confirm",
          cancelButtonText: "Back",
        }).then((willChange) => {
          if (willChange.value) {

            this.store.dispatch(new StudyReleaseDate.Update(dateTo)).subscribe(
              (completed) => {
                this.closeModal();
                toastr.success("Study release date updated.", "Success", this.toastrSettings);

              }
            )


          }
        });
      }
    }
  }

  strPad(n) {
    return String("00" + n).slice(-2);
  }

  ngOnInit() {}

  openModal() {
    if (!this.isReadOnly) {
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }
}

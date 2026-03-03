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
  studyReleaseDate$: Observable<string> = inject(Store).select(GeneralMetadataState.releaseDate);
  studyStatus$: Observable<string> = inject(Store).select(GeneralMetadataState.status);
  readonly$: Observable<boolean> = inject(Store).select(ApplicationState.readonly);
  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  private toastrSettings: Record<string, any> = {};

  isReadOnly = false;

  isModalOpen = false;
  isFormBusy = false;
  requestedStudy: string = null;
  releaseDate: string = null;
  confirmedReleaseDate: string = null;
  minReleaseDate: string = this.normalizeDateToYmd(new Date());
  status: string = null;
  releaseDateFilter = (date: string | null): boolean => {
    if (!date) {
      return false;
    }
    const normalized = this.normalizeDateToYmd(date);
    return !!normalized && normalized >= this.minReleaseDate;
  };


  constructor(private editorService: EditorService, private store: Store) {
    this.setUpSubscriptionsNgxs();
  }



  setUpSubscriptionsNgxs() {
    this.studyReleaseDate$.subscribe((value) => {
      if (value !== null) {
        if (value.toString() !== "") {
          this.releaseDate = this.normalizeDateToYmd(value);
          this.confirmedReleaseDate = this.releaseDate;
        } else {
          this.editorService.metaInfo().subscribe((response) => {
            this.releaseDate = this.normalizeDateToYmd(response.data[1].split(":")[1]);
            this.confirmedReleaseDate = this.releaseDate;
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
    this.studyStatus$.subscribe((value) => {
      if (value != null) {
        this.status = value;
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
      const dateTo = this.normalizeDateToYmd(e?.value);
      if (dateTo != null && dateTo >= this.minReleaseDate) {
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
                this.confirmedReleaseDate = dateTo;
                this.releaseDate = dateTo;
                this.closeModal();
                toastr.success("Study release date updated.", "Success", this.toastrSettings);
              }
            )
          } else {
            this.releaseDate = this.confirmedReleaseDate;
          }
        });
      } else if (dateTo != null) {
        this.releaseDate = this.confirmedReleaseDate;
        toastr.error("Release date cannot be in the past.", "Invalid Date", this.toastrSettings);
      }
    }
  }

  private normalizeDateToYmd(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return (
        value.getFullYear() +
        "-" +
        this.strPad(value.getMonth() + 1) +
        "-" +
        this.strPad(value.getDate())
      );
    }

    const text = String(value).trim();
    const ymdMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
    }

    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
      return (
        parsed.getFullYear() +
        "-" +
        this.strPad(parsed.getMonth() + 1) +
        "-" +
        this.strPad(parsed.getDate())
      );
    }

    return null;
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

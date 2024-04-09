import {
  Component,
  OnInit,
  Input,
  Inject,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NgRedux, select } from "@angular-redux/store";
import Swal from "sweetalert2";
import { ActivatedRoute } from "@angular/router";
import { EditorService } from "../../../services/editor.service";
import * as toastr from "toastr";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { Select, Store } from "@ngxs/store";
import { GeneralMetadataState } from "src/app/ngxs-store/study/general-metadata/general-metadata.state";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { StudyReleaseDate } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";

@Component({
  selector: "mtbls-release-date",
  templateUrl: "./release-date.component.html",
  styleUrls: ["./release-date.component.css"],
})
export class ReleaseDateComponent implements OnInit {
  @select((state) => state.study.releaseDate) studyReleaseDate;
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.readonly) readonly;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>;
  @Select(GeneralMetadataState.releaseDate) studyReleaseDate$: Observable<Date>;
  @Select(ApplicationState.readonly) readonly$: Observable<boolean>;
  @Select(ApplicationState.toastrSettings) toastrSettings$: Observable<Record<string, any>>;

  private toastrSettings: Record<string, any> = {};

  isReadOnly = false;

  isModalOpen = false;
  isFormBusy = false;
  requestedStudy: string = null;
  releaseDate: Date = null;


  constructor(private editorService: EditorService, private store: Store) {
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) this.setUpSubscriptionsNgxs();
  }

  setUpSubscriptions() {
    this.toastrSettings$.subscribe(settings => {this.toastrSettings = settings})
    this.studyReleaseDate.subscribe((value) => {
      if (value !== null) {
        if (value !== "") {
          this.releaseDate = value;
        } else {
          this.editorService.metaInfo().subscribe((response) => {
            this.releaseDate = response.data[1].split(":")[1];
            this.updateReleaseDateSilent(this.releaseDate);
          });
        }
      }
    });
    this.studyIdentifier.subscribe((value) => {
      if (value != null) {
        this.requestedStudy = value;
      }
    });
    this.readonly.subscribe((value) => {
      if (value != null) {
        this.isReadOnly = value;
      }
    });
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
      this.editorService.changeReleasedate(val).subscribe(
        (data) => {
          console.log(
            "Release date missing in investigation file. Updated release date in investigation"
          );
        },
        (err) => {}
      );
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
            if (environment.useNewState) {
              this.store.dispatch(new StudyReleaseDate.Update(dateTo)).subscribe(
                (completed) => {
                  this.closeModal();
                  toastr.success("Study release date updated.", "Success", this.toastrSettings);

                }
              )
            }
            else {
              this.editorService.changeReleasedate(dateTo).subscribe(
                (data) => {
                  this.closeModal();
                  toastr.success("Study release date updated.", "Success", {
                    timeOut: "2500",
                    positionClass: "toast-top-center",
                    preventDuplicates: true,
                    extendedTimeOut: 0,
                    tapToDismiss: false,
                  });
                  this.editorService.loadStudy(this.requestedStudy, false);
                },
                (err) => {
                  this.closeModal();
                  Swal.fire({
                    title: err.json().message,
                  });
                }
              );
            }

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

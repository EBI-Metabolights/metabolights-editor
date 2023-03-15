import { Router, ActivatedRoute } from "@angular/router";
import { IAppState } from "./../../store";
import { NgRedux, select } from "@angular-redux/store";
import { AfterContentInit, Component, OnInit } from "@angular/core";
import { EditorService } from "../../services/editor.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
/* eslint-disable @typescript-eslint/dot-notation */
@Component({
  selector: "mtbls-console",
  templateUrl: "./console.component.html",
  styleUrls: ["./console.component.css"],
})
export class ConsoleComponent implements OnInit, AfterContentInit {
  @select((state) => state.status.isCurator) isCurator;
  @select((state) => state.status.userStudies) userStudies;

  studies: string[] = [];
  filteredStudies: string[] = [];
  loadingStudies = false;
  filterValue: string = null;
  messageExpanded = false;

  submittedStudies: any = [];

  isConfirmationModalOpen = false;
  baseHref: string;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public http: HttpClient,
    private ngRedux: NgRedux<IAppState>,
    private editorService: EditorService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params.reload) {
        this.editorService.getAllStudies();
        this.baseHref = this.editorService.configService.baseHref;
      }
    });
  }

  ngOnInit() {}

  toggleMessage() {
    this.messageExpanded = !this.messageExpanded;
  }

  createNewStudy() {
    this.submittedStudies = this.studies.filter(
      (study) => study["status"] === "Submitted"
    );
    if (this.submittedStudies.length > 0) {
      this.isConfirmationModalOpen = true;
    } else {
      this.router.navigate(["/guide/create"]);
    }
  }

  closeConfirmation() {
    this.isConfirmationModalOpen = false;
  }

  setUpSubscriptions() {
    this.userStudies.subscribe((value) => {
      if (value === null) {
        this.ngRedux.dispatch({
          type: "SET_LOADING_INFO",
          body: {
            info: "Loading user studies",
          },
        });
        this.editorService.getAllStudies();
      } else {
        this.editorService.toggleLoading(false);
        this.studies = value;
        this.studies.sort(
          (a, b) => +new Date(b["releaseDate"]) - +new Date(a["releaseDate"])
        );
        this.filteredStudies = this.studies;
        this.loadingStudies = false;
      }
    });
  }

  ngAfterContentInit() {
    this.editorService.initialiseStudy(null);
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  formatDate(date) {
    return date;
  }

  filterStudies(value) {
    this.filterValue = value;
    if (value != null) {
      this.filteredStudies = this.studies.filter(
        (s) => s["status"].toLowerCase() === value.toLowerCase()
      );
    } else {
      this.filteredStudies = this.studies;
    }
    this.filteredStudies = this.filteredStudies.sort((a: any, b: any) => 0);
  }

  applyFilter(value) {
    if (value !== "") {
      this.filteredStudies = this.studies.filter((s) => {
        if (value !== "") {
          return (
            this.getString(s).toLowerCase().indexOf(value.toLowerCase()) !== -1
          );
        } else {
          return true;
        }
      });
    }
  }

  getString(s) {
    return s.accession + " " + s.title + " " + s.description;
  }
}

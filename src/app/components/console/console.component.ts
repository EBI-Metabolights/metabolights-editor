import { Router, ActivatedRoute } from "@angular/router";
import { IAppState } from "./../../store";
import { NgRedux, select } from "@angular-redux/store";
import { AfterContentInit, Component, OnInit } from "@angular/core";
import { EditorService } from "../../services/editor.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Select, Store } from "@ngxs/store";
import { SetLoadingInfo } from "src/app/ngxs-store/transitions.actions";
import { Owner, User } from "src/app/ngxs-store/user.actions";
import { UserState } from "src/app/ngxs-store/user.state";
import { IStudyDetail } from "src/app/models/mtbl/mtbls/interfaces/study-detail.interface";
import { Observable } from "rxjs";

/* eslint-disable @typescript-eslint/dot-notation */
@Component({
  selector: "mtbls-console",
  templateUrl: "./console.component.html",
  styleUrls: ["./console.component.css"],
})
export class ConsoleComponent implements OnInit, AfterContentInit {
  @select((state) => state.status.isCurator) isCurator;
  @select((state) => state.status.userStudies) userStudies;
  @select((state) => state.status.user) studyUser;
  @select((state) => state.status.bannerMessage) bannerMessage;
  @select((state) => state.status.maintenanceMode) maintenanceMode;

  @Select(UserState.user) user$: Observable<Owner>
  @Select(UserState.userStudies) userStudies$: Observable<IStudyDetail[]>

  studies: IStudyDetail[] = [];
  filteredStudies: IStudyDetail[] = [];
  loadingStudies = false;
  filterValue: string = null;
  messageExpanded = false;
  curator = false;
  submittedStudies: any = [];
  user=null;
  loginName = "";
  isConfirmationModalOpen = false;
  baseHref: string;
  banner: string = null;
  underMaintenance = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public http: HttpClient,
    private ngRedux: NgRedux<IAppState>,
    private store: Store,
    private editorService: EditorService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params.reload) {
        if (environment.useNewState) {
          console.log('hit console.component constructor if use new state block')
          this.store.dispatch(new User.Studies.Get());}
        else this.editorService.getAllStudies();
        this.baseHref = this.editorService.configService.baseHref;
      }
    });
  }

  ngOnInit() {

    this.editorService.updateHistory(this.route.snapshot);
    this.bannerMessage.subscribe((value) => {
      this.banner = value;
    });
    this.maintenanceMode.subscribe((value) => {
      this.underMaintenance = value;
    });
    this.isCurator.subscribe((value) => {
      this.curator = value;
    });

  }

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
    this.studyUser.subscribe((value) => {
      this.user = value;
      this.loginName = this.user?.email ?? "";
    });
    this.userStudies.subscribe((value) => {
      if (value === null) {
        if (environment.useNewState){this.store.dispatch(new SetLoadingInfo("Loading user studies"))} else{
          this.ngRedux.dispatch({
            type: "SET_LOADING_INFO",
            body: {
              info: "Loading user studies",
            },
          });
        }
        if (environment.useNewState) this.store.dispatch(new User.Studies.Get())
        else this.editorService.getAllStudies();
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

  setUpSubscriptionsNgxs() {
    this.user$.subscribe((value) => {
      this.user = value;
      this.loginName = this.user?.email ?? "";
    });
    this.userStudies$.subscribe((value) => {
      if (value === null) {
        if (environment.useNewState){this.store.dispatch(new SetLoadingInfo("Loading user studies"))} else{
          this.ngRedux.dispatch({
            type: "SET_LOADING_INFO",
            body: {
              info: "Loading user studies",
            },
          });
        }
        if (environment.useNewState) this.store.dispatch(new User.Studies.Get())
        else this.editorService.getAllStudies();
      } else {
        this.editorService.toggleLoading(false);
        this.studies = value;

        this.filteredStudies = this.studies;
        this.loadingStudies = false;
      }
    });
  }

  ngAfterContentInit() {
    this.editorService.initialiseStudy(null);
    if (!environment.isTesting && !environment.useNewState) {
      this.setUpSubscriptions();
    }
    if (environment.useNewState) {
      console.log('hit usenewstate in after content init')
      this.setUpSubscriptionsNgxs();}
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

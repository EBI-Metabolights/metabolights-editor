import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { AfterContentInit, Component, inject, OnInit } from "@angular/core";
import { EditorService } from "../../services/editor.service";
import { HttpClient } from "@angular/common/http";
import { Select, Store } from "@ngxs/store";
import { SetLoadingInfo } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { Owner, User } from "src/app/ngxs-store/non-study/user/user.actions";
import { UserState } from "src/app/ngxs-store/non-study/user/user.state";
import { IStudyDetail } from "src/app/models/mtbl/mtbls/interfaces/study-detail.interface";
import { Observable } from "rxjs";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { filter } from "rxjs/operators";
import { Identifier } from "src/app/ngxs-store/study/general-metadata/general-metadata.actions";
import { RevisionStatusTransformPipe } from "../shared/pipes/revision-status-transform.pipe";
import { CurationStatusTransformPipe } from "../shared/pipes/curation-status-transform.pipe";
import { CurationStatusStarTransformPipe } from "../shared/pipes/curation-status-star-transform.pipe";
import { KeycloakEventType, KeycloakService } from "keycloak-angular";


/* eslint-disable @typescript-eslint/dot-notation */
@Component({
  selector: "mtbls-console",
  templateUrl: "./console.component.html",
  styleUrls: ["./console.component.css"],
})
export class ConsoleComponent implements OnInit, AfterContentInit {

  user$: Observable<Owner> = inject(Store).select(UserState.user);
  userStudies$: Observable<IStudyDetail[]> = inject(Store).select(UserState.userStudies);
  isCurator$: Observable<boolean> = inject(Store).select(UserState.isCurator);
  bannerMessage$: Observable<string> = inject(Store).select(ApplicationState.bannerMessage);
  maintenanceMode$: Observable<boolean> = inject(Store).select(ApplicationState.maintenanceMode);
  revisionStatusTransform = new RevisionStatusTransformPipe()
  curationStatusTransform = new CurationStatusTransformPipe()
  curationStatusStarTransform = new CurationStatusStarTransformPipe()
  studies: IStudyDetail[] = [];
  filteredStudies: IStudyDetail[] = [];
  loadingStudies = false;
  filterValue: string = null;
  messageExpanded = false;
  curator = false;
  provisionalStudies: any = [];
  user=null;
  loginName = "";
  isConfirmationModalOpen = false;
  baseHref: string;
  banner: string = null;
  underMaintenance = false;
  partner: boolean = false;
  loggedIn = false;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public http: HttpClient,
    private store: Store,
    private editorService: EditorService,
    private keycloak: KeycloakService
  ) {

    this.route.queryParams.subscribe((params) => {
      if (params.reload && this.loggedIn) {
        this.store.dispatch(new User.Studies.Get());
        this.baseHref = this.editorService.configService.baseHref;
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: NavigationEnd) => event.url === '/console')
    )
      .subscribe(() => {
        this.resetStudyStates();
      })
  }

  ngOnInit() {
 this.keycloak.keycloakEvents$.subscribe(event => {
      switch (event.type) {

        case KeycloakEventType.OnAuthSuccess:
        case KeycloakEventType.OnAuthRefreshSuccess:
        case KeycloakEventType.OnReady:
          this.loggedIn = true;
          this.store.dispatch(new SetLoadingInfo("Loading user studies"))
          this.store.dispatch(new User.Studies.Get())
          break;
      }
    }
    );
    this.editorService.updateHistory(this.route.snapshot);

    this.bannerMessage$.subscribe((value) => {
      this.banner = value;
    });
    this.maintenanceMode$.subscribe((value) => {
      this.underMaintenance = value;
    });
    this.isCurator$.subscribe((value) => {
      this.curator = value;
    });



  }

  resetStudyStates() {
    document.title = "Metabolights Editor"
    this.editorService.resetStudyStates();
  }

  toggleMessage() {
    this.messageExpanded = !this.messageExpanded;
  }

  createNewStudy() {
    this.provisionalStudies = this.studies.filter(
      (study) => study["status"] === "Provisional"
    );
    if (this.provisionalStudies.length > 0) {
      this.isConfirmationModalOpen = true;
    } else {
      this.router.navigate(["/guide/create"]);
    }
  }

  closeConfirmation() {
    this.isConfirmationModalOpen = false;
  }



  setUpSubscriptionsNgxs() {
    this.user$.subscribe((value) => {
      this.user = value;
      this.loginName = this.user?.email ?? "";
      this.partner = this.user?.partner ?? false;
    });
    this.userStudies$.subscribe((value) => {
      if (this.keycloak.isLoggedIn()) {
        if (value === null) {
          this.store.dispatch(new SetLoadingInfo("Loading user studies"))
          this.store.dispatch(new User.Studies.Get())
        } else {
          this.editorService.toggleLoading(false);
          this.studies = value;

          this.filteredStudies = this.studies;
          this.loadingStudies = false;
        }
      } else {
        this.loadingStudies = false;
        this.studies = []
      }


    });
  }

  ngAfterContentInit() {
    this.editorService.initialiseStudy(null);
    this.setUpSubscriptionsNgxs();
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

  studyClick(study: IStudyDetail, view: string) {
    //this.store.dispatch(new Identifier.Set(study.accession));
    //this.router.navigate([`${view}`, study.accession]);
  }
}

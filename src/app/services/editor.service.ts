import { Injectable } from "@angular/core";
import { MetabolightsService } from "./../services/metabolights/metabolights.service";
import { AuthService } from "./../services/metabolights/auth.service";
import { IAppState } from "./../store";
import { NgRedux, select } from "@angular-redux/store";
import { ActivatedRouteSnapshot, Router } from "@angular/router";

import { catchError, map, observeOn } from "rxjs/operators";

import { httpOptions, MtblsJwtPayload, MetabolightsUser, StudyPermission } from "./../services/headers";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "../configuration.service";
import { stringify } from "@angular/compiler/src/util";
import jwtDecode from "jwt-decode";
import { MTBLSStudy } from "../models/mtbl/mtbls/mtbls-study";
import * as toastr from "toastr";
import { HttpHeaders } from "@angular/common/http";
import { Observable, of, interval, asapScheduler, asyncScheduler } from "rxjs";
import { VersionInfo } from "src/environment.interface";
import { PlatformLocation } from "@angular/common";
import { Ontology } from "../models/mtbl/mtbls/common/mtbls-ontology";
import { Select, Store } from "@ngxs/store";
import { Loading, SetLoadingInfo } from "../ngxs-store/transitions.actions";
import { env } from "process";
import { User } from "../ngxs-store/user.actions";
import { GetGeneralMetadata, Identifier } from "../ngxs-store/study/general-metadata.actions";
import { GeneralMetadataState } from "../ngxs-store/study/general-metadata.state";
import { read } from "fs";
import { AssayState } from "../ngxs-store/study/assay/assay.state";
import { IAssay } from "../models/mtbl/mtbls/interfaces/assay.interface";
import { FilesState } from "../ngxs-store/study/files/files.state";
import { IStudyFiles } from "../models/mtbl/mtbls/interfaces/study-files.interface";
import { ValidationState } from "../ngxs-store/study/validation/validation.state";

/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable  @typescript-eslint/no-unused-expressions */

// this is sinful as eval is a huge nono, but it would take too long to fix right now.
// TODO: remove any references to eval.
/* eslint-disable no-eval */

// disabling this as properties mirror that of actual file columns.
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/dot-notation */
export function disambiguateUserObj(user) {
  if (typeof user === "string") {
    console.error("received string when JSON object expected.");
  }
  return user.owner ? user.owner.apiToken : user.apiToken;
}

@Injectable({
  providedIn: "root",
})
export class EditorService {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.validations) studyValidations;
  @select((state) => state.study.files) studyFiles;
  @select((state) => state.study.studyAssays) studyAssays;
  @select((state) => state.study) stateStudy;
  @select((state) => state.status.controlLists) controlLists;
  
  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>
  @Select(FilesState.files) studyFiles$: Observable<IStudyFiles>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;




  study: MTBLSStudy;
  baseHref: string;
  redirectUrl = "";
  currentStudyIdentifier: string = null;
  validations: any = {};
  defaultControlLists: any = {};
  files: any = [];
  samples_columns_order: any = {
    "Sample Name": 1,
    "Characteristics[Organism]": 2,
    "Characteristics[Organism part]": 3,
    "Characteristics[Variant]": 4,
    "Characteristics[Sample type]": 5,
    "Protocol REF": 6,
    "Source Name": 7,
  };
  ontologyDetails: any = {};

  constructor(
    public ngRedux: NgRedux<IAppState>,
    public store: Store,
    private router: Router,
    private authService: AuthService,
    private dataService: MetabolightsService,
    public configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
    if (environment.useNewState) { this.setUpSubscriptionsNgxs(); } else {
      this.studyIdentifier.subscribe((value) => {
        this.currentStudyIdentifier = value;
      });
      this.stateStudy.subscribe((value) => {
        this.study = value;
      });
      this.studyValidations.subscribe((value) => {
        this.validations = value;
      });
      this.studyFiles.subscribe((value) => {
        this.files = value;
      });
  
      this.controlLists.subscribe((value) => {
        if (value) {
          Object.keys(value).forEach((label: string)=>{
            this.defaultControlLists[label] = {OntologyTerm: []};
            value[label].forEach(term => {
              this.defaultControlLists[label].OntologyTerm.push({
                annotationDefinition: term.definition,
                annotationValue: term.name,
                termAccession: term.iri,
                comments: [],
                termSource: {
                  comments: [],
                  name: term.onto_name,
                  description: term.onto_name === "MTBLS" ? "Metabolights Ontology" : "",
                  file: term.provenance_name,
                  provenance_name: term.provenance_name,
                  version: ""
                },
                wormsID: ""
              });
            });
          });
        }
      });
    }
    this.redirectUrl = this.configService.config.redirectURL;
   
  }

  setUpSubscriptionsNgxs() {
    this.studyIdentifier$.subscribe((value) => {
      this.currentStudyIdentifier = value;
    });
    this.stateStudy.subscribe((value) => {
      this.study = value;
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyFiles$.subscribe((value) => {
      this.files = value;
    });

    this.controlLists.subscribe((value) => {
      if (value) {
        Object.keys(value).forEach((label: string)=>{
          this.defaultControlLists[label] = {OntologyTerm: []};
          value[label].forEach(term => {
            this.defaultControlLists[label].OntologyTerm.push({
              annotationDefinition: term.definition,
              annotationValue: term.name,
              termAccession: term.iri,
              comments: [],
              termSource: {
                comments: [],
                name: term.onto_name,
                description: term.onto_name === "MTBLS" ? "Metabolights Ontology" : "",
                file: term.provenance_name,
                provenance_name: term.provenance_name,
                version: ""
              },
              wormsID: ""
            });
          });
        });
      }
    });
  }

  login(body) {
    return this.authService.login(body);
  }

  logout(redirect) {

    this.clearSessionData();

    this.ngRedux.dispatch({
      type: "RESET",
    });
    if (this.configService.config.clearJavaSession && redirect) {
      window.location.href = this.configService.config.javaLogoutURL;
    } else {
      this.router.navigate([this.configService.config.loginURL]);
    }
  }

  authenticateAPIToken(body) {
    return this.authService.authenticateToken(body);
  }

  getValidatedJWTUser(body) {
    return this.authService.getValidatedJWTUser(body);
  }
  getAuthenticatedUser(jwt, userName) {
    return this.authService.getAuthenticatedUser(jwt, userName);
  }

  metaInfo() {
    return this.dataService.getMetaInfo();
  }

  loadStudyInReview(id) {
    this.loadStudyId(id);
    this.loadStudy(id, true);
    // this.loadValidations();
  }

  loadPublicStudy(body) {
    this.loadStudyId(body.id);
    this.loadStudy(body.id, true);
    // if(this.study !== null && this.study.status !== null && this.study.status !== "Public"){
    //   this.loadValidations();
    // }
  }
  /**
   * Retrieves publication information for a given study.
   *
   * @returns A Publication wrapper object via the Observable
   */
  getBannerHeader(): Observable<any> {
    return this.dataService.http
      .get<any>(
        this.dataService.url.baseURL + "/ebi-internal/banner",
        {
          headers: httpOptions.headers,
          observe: "body",
        }
      )
      .pipe(catchError(this.dataService.handleError));
  }



    /**
   * Retrieves publication information for a given study.
   *
   * @returns A Publication wrapper object via the Observable
   */
    getDefaultControlLists(): Observable<any> {
      return this.dataService.http
        .get<any>(
          this.dataService.url.baseURL + "/ebi-internal/control-lists",
          {
            headers: httpOptions.headers,
            observe: "body",
          }
        )
        .pipe(catchError(this.dataService.handleError));
    }

  checkMaintenaceMode(): Observable<any> {
    return this.dataService.http
      .get<any>(
        this.dataService.url.baseURL + "/ebi-internal/ws-status",
        {
          headers: httpOptions.headers,
          observe: "body",
        }
      )
      .pipe(catchError(this.dataService.handleError));
  }

  async getJwtWithOneTimeToken(oneTimeToken: string) {
    const config = this.configService.config;
    const url = config.metabolightsWSURL.baseURL + config.authenticationURL.getJwtWithOneTimeToken;
    const requestHeaders = new HttpHeaders({
      Accept: "application/json",
      one_time_token: oneTimeToken
    });
    interface RequestBody {
      jwt: string;
    }
    try {
      const response = await this.authService.http.get<RequestBody>(url,
        {
          headers: requestHeaders,
          observe: "body",
        }
      ).toPromise();
      return response.jwt;
    } catch (err) {
      console.log(err);
      toastr.error(err.message, "Error", {
        timeOut: "5000",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: true,
      });
      return null;
    }
  }

  async getStudyPermissionByObfuscationCode(obfuscationCode: string) {
    return this.getStudyPermission(obfuscationCode, "/auth/permissions/obfuscationcode/");
  }

  async getStudyPermissionByStudyId(studyId: string) {
    return this.getStudyPermission(studyId, "/auth/permissions/accession-number/");
  }

  async getStudyPermission(key: string, path: string) {
    const url = this.configService.config.metabolightsWSURL.baseURL + path + key;
    try {
      const response = await this.authService.http.get<StudyPermission>(url,
        {
          headers: httpOptions.headers,
          observe: "body",
        }
      ).toPromise();
      return response;
    } catch (err) {
      console.log(err);
      const errorMessage = err.error.message
      ? err.error.message
      : err.message ? err.message : "Study permission check error.";
      toastr.error(err.error.message, "Error", {
        timeOut: "2500",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: true,
      });
      return null;
    }
  }

  async updateSession(){
    const activeJwt = localStorage.getItem("jwt");
    const localUser = localStorage.getItem("user");
    const user: MetabolightsUser = JSON.parse(localUser);

    this.getDefaultControlLists().subscribe(
      (response) => {
        const controlLists = response.controlLists;
        this.ngRedux.dispatch({ type: "SET_DEFAULT_CONTROL_LISTS", body: { controlLists} });
        },
        (error) => {
          this.ngRedux.dispatch({ type: "SET_DEFAULT_CONTROL_LISTS", body: { controlLists: {}} });
        }
    );

    this.getBannerHeader().subscribe(
      (response) => {
        const message = response.content;
        this.ngRedux.dispatch({ type: "SET_BANNER_MESSAGE", body: { bannerMessage: message} });
        },
        (error) => {
          this.ngRedux.dispatch({ type: "SET_BANNER_MESSAGE", body: { bannerMessage: null} });
        }
    );
    this.checkMaintenaceMode().subscribe(
      (response) => {
        const result = response.content;
        this.ngRedux.dispatch({ type: "SET_MAINTENANCE_MODE", body: { maintenanceMode: result} });
        },
        (error) => {
          this.ngRedux.dispatch({ type: "SET_MAINTENANCE_MODE", body: { maintenanceMode: false} });
        }
    );

    if(activeJwt !== null){
      const decoded = jwtDecode<MtblsJwtPayload>(activeJwt);
      const username = decoded.sub;
      if (user === null || user.email !== username){
        this.clearSessionData();
        this.ngRedux.dispatch({
          type: "RESET",
        });
        await this.loginWithJwt(activeJwt, username);
        return true;
      } else {
        // console.log('user json ' + user);
        const isCurator = user.role === "ROLE_SUPER_USER" ? "true" : "false";
        localStorage.setItem("isCurator", isCurator);
        const apiToken = user.apiToken ?? "";
        localStorage.setItem("apiToken", apiToken);
        localStorage.setItem("username", user.email);
        localStorage.setItem("jwtExpirationTime", decoded.exp.toString());
        this.initialise(localUser, false);
      }
      return false;
    } else {
      this.clearSessionData();
    }
    return false;
  }

  updateHistory(state: ActivatedRouteSnapshot) {
    const queryParams = state.queryParamMap;

    let location = window.location.origin;
    if  (window.location.pathname.startsWith("/")){
      location = location + window.location.pathname;
    } else {
      location = location + "/" + window.location.pathname;
    }

    if (queryParams.keys.length > 0) {
      const params = Array(0);
      for (const i of queryParams.keys) {
        if (i !== "loginOneTimeToken") {
          params.push(i + "=" + queryParams.get(i));
        }
      }
      if (params.length > 0) {
        location = window.location.origin + "/" + window.location.pathname + "?" + params.join("&");
      }
    }
    window.history.pushState(
      "",
      "",
      location
    );
  }

  clearSessionData(){
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("jwtExpirationTime");
    localStorage.removeItem("user");
    localStorage.removeItem("isCurator");
    localStorage.removeItem("userToken");
    localStorage.removeItem("apiToken");
    localStorage.removeItem("loginOneTimeToken");
  }

  async loginWithJwt(jwtToken: string, userName: string) {
    const body = { jwt: jwtToken, user: userName };
    const url = this.configService.config.metabolightsWSURL.baseURL + this.configService.config.authenticationURL.initialise;
    const response = await this.authService.http.post(url, body, httpOptions).toPromise();
    const decoded = jwtDecode<MtblsJwtPayload>(jwtToken);
    const expiration = decoded.exp;
    localStorage.setItem("jwt", jwtToken);

    localStorage.setItem("username", userName);
    localStorage.setItem("jwtExpirationTime", expiration.toString());
    return this.initialise(response, true);
  }

  initialise(data, signInRequest) {
    interface User {
      updatedAt: number;
      owner: { apiToken: string; role: string; email: string; status: string };
      message: string;
      err: string;
    }

    if (signInRequest) {
      const userstr = data.content;
      const user: User = JSON.parse(userstr);
      // console.log('user json ' + user);
      localStorage.setItem("user", JSON.stringify(user.owner));
      const isCurator = user.owner.role === "ROLE_SUPER_USER" ? "true" : "false";
      localStorage.setItem("isCurator", isCurator);
      httpOptions.headers = httpOptions.headers.set(
        "user_token",
        user.owner.apiToken
      );
      this.ngRedux.dispatch({
        type: "INITIALISE",
      });
      if (environment.useNewState) this.store.dispatch(new User.Set(user.owner));
      else this.ngRedux.dispatch({ type: "SET_USER", body: { user: user.owner, },});
      this.ngRedux.dispatch({
        type: "SET_USER_STUDIES",
        body: {
          studies: null,
        },
      });

      this.loadValidations();
      return true;
    } else {
      const user = JSON.parse(data);
      httpOptions.headers = httpOptions.headers.set(
        "user_token",
        disambiguateUserObj(user)
      );
      const isCurator = user.role === "ROLE_SUPER_USER" ? "true" : "false";
      localStorage.setItem("isCurator", isCurator);
      this.ngRedux.dispatch({
        type: "INITIALISE",
      });
      if (environment.useNewState) this.store.dispatch(new User.Set(user));
      else this.ngRedux.dispatch({ type: "SET_USER", body: { user: user, },});
      this.ngRedux.dispatch({
        type: "SET_USER_STUDIES",
        body: {
          studies: null,
        },
      });
      this.loadValidations();
      return true;
    }
  }

  loadValidations() {
    if (this.validations) {
      return;
    }

    this.dataService.getValidations().subscribe(
      (validations) => {
        if (environment.useNewState) this.store.dispatch(new SetLoadingInfo("Loading study validations"))
        else this.ngRedux.dispatch({type: "SET_LOADING_INFO",body: { info: "Loading study validations",},});
        
        this.ngRedux.dispatch({
          type: "LOAD_VALIDATION_RULES",
          body: {
            validations,
          },
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  refreshValidations() {
    return this.dataService.refreshValidations();
  }

  overrideValidations(data) {
    return this.dataService.overrideValidations(data);
  }

  /**
   * Add a new comment via the DataService
   *
   * @param data - generic json object containing the new comment.
   * @returns An observable object from the Data Service indicating the success of the operation.
   */
  addComment(data) {
    return this.dataService.addComment(data);
  }


  loadApiVersionInfo(){
    this.dataService.getApiInfo().subscribe(versionInfo => {
      console.log("Loaded API version: " + versionInfo.about.api.version);
      this.ngRedux.dispatch({
        type: "SET_BACKEND_VERSION",
        body: {
          backendVersion: versionInfo,
        },
      });
    },
    (err) => {
      const noVersion = {
        app: {
          version: "",
          name: ""
        },
        api: {
          version: "",
        }
      };
      this.ngRedux.dispatch({
        type: "SET_BACKEND_VERSION",
        body: {
          backendVersion: noVersion,
        },
      });
    }
    );
  }

  loadVersionInfo(){
    const url = this.baseHref + "assets/configs/version.json";
    this.dataService.http.get<VersionInfo>(url).subscribe(versionInfo => {
      console.log("Loaded version: " + versionInfo.version + "-" + versionInfo.releaseName);
      this.ngRedux.dispatch({
        type: "SET_EDITOR_VERSION",
        body: {
          editorVersion: versionInfo,
        },
      });
    },
    (err) => {
      const noVersion = {
        version: "",
        releaseName: ""
      };
      this.ngRedux.dispatch({
        type: "SET_EDITOR_VERSION",
        body: {
          editorVersion: noVersion,
        },
      });
    }
    );
  }

  loadGuides() {
    this.dataService.getLanguageMappings().subscribe(
      (mappings) => {
        this.ngRedux.dispatch({
          type: "SET_GUIDES_MAPPINGS",
          body: {
            mappings,
          },
        });
        const selected_language = localStorage.getItem("selected_language");
        mappings["languages"].forEach((language) => {
          if (
            (selected_language && language.code === selected_language) ||
            (!selected_language && language.default)
          ) {
            this.ngRedux.dispatch({
              type: "SET_SELECTED_LANGUAGE",
              body: {
                language: language.code,
              },
            });

            this.dataService.getGuides(language.code).subscribe((guides) => {
              this.ngRedux.dispatch({
                type: "SET_GUIDES",
                body: {
                  guides: guides["data"],
                },
              });
            });
          }
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  loadLanguage(language) {
    this.dataService.getGuides(language).subscribe((guides) => {
      localStorage.setItem("selected_language", language);
      this.ngRedux.dispatch({
        type: "SET_SELECTED_LANGUAGE",
        body: {
          language,
        },
      });
      this.ngRedux.dispatch({
        type: "SET_GUIDES",
        body: {
          guides: guides["data"],
        },
      });
    });
  }

  getAllStudies() {
    this.dataService.getAllStudies().subscribe((response) => {
      this.ngRedux.dispatch({
        type: "SET_USER_STUDIES",
        body: {
          studies: response.data,
        },
      });
    });
  }

  loadStudyId(id) {
    if (environment.useNewState) return this.store.dispatch(new Identifier.Set(id))
    else return this.ngRedux.dispatch({
      type: "SET_STUDY_IDENTIFIER",
      body: {
        study: id,
      },
    });
  }

  createStudy() {
    return this.dataService.createStudy();
  }

  toggleLoading(status) {
    console.log('hit toggle loading in editor service')
    if (environment.useNewState) {
      status !== null ? (
        status ? this.store.dispatch(new Loading.Enable()) : this.store.dispatch(new Loading.Disable())
        ) : this.store.dispatch(new Loading.Toggle())
    } else {
      if (status !== null) {
        if (status) {
          this.ngRedux.dispatch({ type: "ENABLE_LOADING" });
        } else {
          this.ngRedux.dispatch({ type: "DISABLE_LOADING" });
        }
      } else {
        this.store.dispatch(new Loading.Toggle())
        this.ngRedux.dispatch({ type: "TOGGLE_LOADING" });
      }
    }


  }

  initialiseStudy(route) {
    if (route === null) {
      return this.loadStudyId(null);
    } else {
      route.params.subscribe((params) => {
        const studyID = params.id;
        if (this.currentStudyIdentifier !== studyID) {
          this.loadStudy(studyID, false);
        }
      });
    }
  }

  toggleProtocolsExpand(value) {
    this.ngRedux.dispatch({ type: "SET_PROTOCOL_EXPAND", body: value });
  }

  loadStudyNgxs(studyID, readonly) {
    this.store.dispatch(new GetGeneralMetadata(studyID, readonly))
  }

  //REMOVE POST STATE MIGRATION
  loadStudy(studyID, readonly) {
    this.toggleLoading(true);
    this.loadStudyId(studyID);
    this.dataService.getStudy(studyID).subscribe(
      (study) => {
        this.ngRedux.dispatch({
          type: "SET_STUDY_ERROR",
          body: {
            investigationFailed: false,
          },
        });

        if (environment.useNewState) this.store.dispatch(new SetLoadingInfo("Loading investigation details"))
        else this.ngRedux.dispatch({ type: "SET_LOADING_INFO", body: { info: "Loading investigation details",},});

        this.ngRedux.dispatch({
          type: "SET_CONFIGURATION",
          body: {
            configuration: study.isaInvestigation.comments,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_TITLE",
          body: {
            title: study.isaInvestigation.studies[0].title,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_ABSTRACT",
          body: {
            description: study.isaInvestigation.studies[0].description,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_SUBMISSION_DATE",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_RELEASE_DATE",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_STATUS",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_REVIEWER_LINK",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_PUBLICATIONS",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_ASSAYS",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_PEOPLE",
          body: {
            study,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_DESIGN_DESCRIPTORS",
          body: {
            studyDesignDescriptors:
              study.isaInvestigation.studies[0].studyDesignDescriptors,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_FACTORS",
          body: {
            factors: study.isaInvestigation.studies[0].factors,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_PROTOCOLS",
          body: {
            protocols: study.isaInvestigation.studies[0].protocols,
          },
        });
        this.loadStudyFiles(false);
        if (!readonly) {
          this.getValidationReport();
          this.ngRedux.dispatch({
            type: "SET_STUDY_READONLY",
            body: {
              readonly: false,
            },
          });
        } else {
          this.ngRedux.dispatch({
            type: "SET_STUDY_READONLY",
            body: {
              readonly: true,
            },
          });
          this.toggleLoading(false);
        }
      },
      (error) => {
        this.toggleLoading(false);
        this.ngRedux.dispatch({
          type: "SET_STUDY_ERROR",
          body: {
            investigationFailed: true,
          },
        });
        this.loadStudyFiles(false);
        if (!readonly) {
          this.getValidationReport();
        }
      }
    );
  }

  // REMOVE POST STATE MIGRATION
  getValidationReport() {
    this.dataService.getValidationReport().subscribe(
      (response) => {
        this.toggleLoading(false);
        this.ngRedux.dispatch({
          type: "SET_STUDY_VALIDATION",
          body: {
            validation: response.validation,
          },
        });
      },
      (error) => {
        this.toggleLoading(false);
      }
    );
  }

  getValidationReportRetry(retry: number = 5, period: number=3000) {
    let repeat = 0;
    this.dataService.getValidationReport().subscribe(reportResponse => {
      if (reportResponse.validation.status === "not ready"){
        const validationReportPollInvertal = interval(period);
        const validationReportLoadSubscription = validationReportPollInvertal.subscribe(x => {
          this.dataService.getValidationReport().subscribe(nextReportResponse => {
            repeat = repeat + 1;
          if (nextReportResponse.validation.status !== "not ready"){
            validationReportLoadSubscription.unsubscribe();
            this.ngRedux.dispatch({
              type: "SET_STUDY_VALIDATION",
              body: {
                validation: nextReportResponse.validation,
              }
            });
          }
          if (repeat > retry) {
            validationReportLoadSubscription.unsubscribe();
            this.ngRedux.dispatch({
              type: "SET_STUDY_VALIDATION",
              body: {
                validation: nextReportResponse.validation,
              }
            });
          }
          });
        });
      } else {
        this.ngRedux.dispatch({
          type: "SET_STUDY_VALIDATION",
          body: {
            validation: reportResponse.validation,
          },
        });
      }
    });

  }

  // REMOVE POST STATE MIGRATION
  loadStudyFiles(force, readonly: boolean = true) {
    // console.log("Loading Study files..")
    // console.log("Force files list calculation - "+fource)
    this.dataService.getStudyFilesFetch(force, readonly).subscribe(
      (data) => {
        // console.log("Got the files list  !")
        this.ngRedux.dispatch({
          type: "SET_UPLOAD_LOCATION",
          body: {
            uploadLocation: data.uploadPath,
          },
        });
        this.ngRedux.dispatch({
          type: "SET_OBFUSCATION_CODE",
          body: {
            obfuscationCode: data.obfuscationCode,
          },
        });
        data = this.deleteProperties(data);
        this.ngRedux.dispatch({ type: "SET_STUDY_FILES", body: data });
        this.loadStudySamples();
        this.loadStudyAssays(data);
      },
      (error) => {
        this.dataService
          .getStudyFilesList(null, null, null, null)
          .subscribe((data) => {
            this.ngRedux.dispatch({
              type: "SET_UPLOAD_LOCATION",
              body: {
                uploadLocation: data.uploadPath,
              },
            });
            this.ngRedux.dispatch({
              type: "SET_OBFUSCATION_CODE",
              body: {
                obfuscationCode: data.obfuscationCode,
              },
            });
            data = this.deleteProperties(data);
            this.ngRedux.dispatch({ type: "SET_STUDY_FILES", body: data });
          });
      }
    );
  }

  loadStudyProtocols() {
    this.dataService.getProtocols(null).subscribe((data) => {
      this.ngRedux.dispatch({
        type: "SET_STUDY_PROTOCOLS",
        body: {
          protocols: data.protocols,
        },
      });
    });
  }

  deleteStudyFiles(id, body, location, force) {
    return this.dataService.deleteStudyFiles(id, body, location, force);
  }

  deleteStudy(id) {
    return this.dataService.deleteStudy(id);
  }

  decompressFiles(body) {
    return this.dataService.decompressFiles(body);
  }

  getStudyFiles(id, includeRawFiles) {
    return this.dataService.getStudyFiles(id, includeRawFiles);
  }

  getStudyFilesList(id, include_sub_dir, dir) {
    return this.dataService.getStudyFilesList(id, include_sub_dir, dir, null);
  }

  syncFiles(data) {
    return this.dataService.syncFiles(data);
  }

  loadStudyDirectory(dir, parent) {
    return this.dataService.getStudyFilesList(null, false, dir, parent);
  }

  loadStudyDirectoryFromLocation(dir, parent, location) {
    return this.dataService.getStudyFilesListFromLocation(null, false, dir, parent, location);
  }

  extractAssayDetails(assay) {
    if (this.validations === undefined) {
      this.loadValidations();
    }
    if (assay.name.split(this.currentStudyIdentifier)[1]) {
      const assayInfo = assay.name
        .split(this.currentStudyIdentifier)[1]
        .split("_");
      let assaySubTechnique = null;
      let assayTechnique = null;
      let assayMainTechnique = null;
      if (this.validations) {
        this.validations["assays"]["assaySetup"].main_techniques.forEach((mt) => {
          mt.techniques.forEach((t) => {
            if (t.sub_techniques && t.sub_techniques.length > 0) {
              t.sub_techniques.forEach((st) => {
                if (st.template === assayInfo[1] || (assayInfo.length > 1 && st.template === assayInfo[2])) {
                  assaySubTechnique = st;
                  assayTechnique = t;
                  assayMainTechnique = mt;
                }
              });
            }
          });
        });
      }
      return {
        assaySubTechnique,
        assayTechnique,
        assayMainTechnique,
      };
    }
    return {
      assaySubTechnique: "",
      assayTechnique: "",
      assayMainTechnique: "",
    };
  }

  loadStudySamples() {
    if (this.files === null) {
      this.loadStudyFiles(false);
    } else {
      let samplesExist = false;
      this.files.study.forEach((file) => {
        if (file.file.indexOf("s_") === 0 && file.status === "active") {
          if (environment.useNewState) this.store.dispatch(new SetLoadingInfo("Loading samples data"))
          else this.ngRedux.dispatch({type: "SET_LOADING_INFO",body: {info: "Loading Samples data",},});
          samplesExist = true;
          this.updateSamples(file.file);
        }
      });
      if (!samplesExist) {
        Swal.fire({
          title: "Error",
          text: "Sample sheet missing. Please upload sample sheet.",
          showCancelButton: false,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "OK",
        });
      }
    }
  }

  loadStudyAssays(files) {

    if (environment.useNewState) this.store.dispatch(new SetLoadingInfo("Loading assays information"))
    else this.ngRedux.dispatch({ type: "SET_LOADING_INFO", body: {info: "Loading assays information",},});
    files.study.forEach((file) => {
      if (file.file.indexOf("a_") === 0 && file.status === "active") {
        this.updateAssay(file.file);
      }
    });
  }

  updateTableState(filename, tableType, metaInfo) {
    if (tableType === "samples") {
      this.updateSamples(filename);
    } else if (tableType === "assays") {
      this.updateAssay(filename);
    } else if (tableType === "maf") {
      this.updateMAF(filename);
    }
  }
  updateAssay(file) {
    this.dataService.getTable(file).subscribe((data) => {
      const assay = {};
      assay["name"] = file;
      assay["meta"] = this.extractAssayDetails(assay);
      const columns = [];
      Object.keys(data.header).forEach((key) => {
        const fn = "element['" + key + "']";
        columns.push({
          columnDef: key,
          sticky: "false",
          header: key,
          cell: (element) => eval(fn),
        });
      });
      let displayedColumns = columns.map((a) => a.columnDef);
      displayedColumns.unshift("Select");
      displayedColumns = displayedColumns.filter(
        (key) =>
          key.indexOf("Term Accession Number") < 0 &&
          key.indexOf("Term Source REF") < 0
      );
      data["columns"] = columns;
      data["displayedColumns"] = displayedColumns;
      data["file"] = file;
      data.data.rows ? (data["rows"] = data.data.rows) : (data["rows"] = []);
      delete data.data;
      assay["data"] = data;
      const protocols = [];
      protocols.push("Sample collection");
      if (data["rows"].length > 0) {
        columns.forEach((c) => {
          if (c.header.indexOf("Protocol REF") > -1) {
            protocols.push(data["rows"][0][c.header]);
          }
        });
      }
      assay["protocols"] = protocols;

      const mafFiles = [];
      data["rows"].forEach((row) => {
        // assert that this given value in the row is a string, as we _know_ it can only be a string.
        const assertedRow = row["Metabolite Assignment File"] as string;
        const mafFile = assertedRow.replace(/^[ ]+|[ ]+$/g, "");
        if (mafFile !== "" && mafFiles.indexOf(mafFile) < 0) {
          mafFiles.push(mafFile);
        }
      });
      mafFiles.forEach((f) => {
        this.updateMAF(f);
      });
      assay["mafs"] = mafFiles;
      this.ngRedux.dispatch({ type: "SET_STUDY_ASSAY", body: assay });
    });
  }

  updateMAF(f) {
    this.dataService.getTable(f).subscribe((mdata) => {
      const mcolumns = [];
      const maf = {};

      mcolumns.push({
        columnDef: "Structure",
        sticky: "true",
        header: "Structure",
        structure: true,
        cell: (element) => eval("element['database_identifier']"),
      });

      Object.keys(mdata.header).forEach((key) => {
        const fn = "element['" + key + "']";
        mcolumns.push({
          columnDef: key, //.toLowerCase().split(" ").join("_")
          sticky: "false",
          header: key,
          cell: (element) => eval(fn),
        });
      });

      let mdisplayedColumns = mcolumns.map((a) => a.columnDef);
      mdisplayedColumns.unshift("Select");
      mdisplayedColumns.sort((a, b) => {
        // assert that the values are numbers, which they have to be as all header values in maf sheet objects are numbers.
        const assertA = mdata.header[a] as number;
        const assertB = mdata.header[b] as number;
        return assertA - assertB;
      });
      mdisplayedColumns = mdisplayedColumns.filter(
        (key) =>
          key.indexOf("Term Accession Number") < 0 &&
          key.indexOf("Term Source REF") < 0
      );

      mdata["columns"] = mcolumns;
      mdata["displayedColumns"] = mdisplayedColumns;
      mdata["rows"] = mdata.data.rows;
      mdata["file"] = f;
      delete mdata.data;

      maf["data"] = mdata;
      this.ngRedux.dispatch({ type: "SET_STUDY_MAF", body: maf });
    });
  }

  search(term, type) {
    return this.dataService.search(term, type).pipe(map((data) => data));
  }

  validateMAF(f) {
    return this.dataService.validateMAF(f).pipe(map((data) => data));
  }

  // REMOVE POST STATE MIGRATION
  updateSamples(file) {
    const samples = {};
    samples["name"] = file;
    this.dataService.getTable(file).subscribe(
      (data) => {
        const columns = [];
        Object.keys(data.header).forEach((key) => {
          const fn = "element['" + key + "']";
          columns.push({
            columnDef: key,
            sticky: key === "Protocol REF" ? "true" : "false",
            header: key,
            cell: (element) => eval(fn),
          });
        });
        let displayedColumns = columns.map((a) => a.columnDef);
        displayedColumns.unshift("Select");
        /* eslint-disable space-before-function-paren */
        displayedColumns.sort(function (a, b) {
          // assert that the values are numbers, which they have to be as all header values in sample sheet objects are numbers.
          const assertA = data.header[a] as number;
          const assertB = data.header[b] as number;
          return assertA - assertB;
        });
        let index = displayedColumns.indexOf("Source Name");
        if (index > -1) {
          displayedColumns.splice(index, 1);
        }

        index = displayedColumns.indexOf("Characteristics[Sample type]");
        if (index > -1) {
          displayedColumns.splice(index, 1);
        }

        displayedColumns.sort(
          (a, b) =>
            /* eslint-disable radix */
            parseInt(this.samples_columns_order[a]) -
            parseInt(this.samples_columns_order[b])
        );

        if (displayedColumns[1] !== "Protocol REF") {
          displayedColumns.splice(displayedColumns.indexOf("Protocol REF"), 1);
          displayedColumns.splice(1, 0, "Protocol REF");
        }

        if (displayedColumns[2] !== "Sample Name") {
          displayedColumns.splice(displayedColumns.indexOf("Sample Name"), 1);
          displayedColumns.splice(2, 0, "Sample Name");
        }
        displayedColumns = displayedColumns.filter(
          (key) =>
            key.indexOf("Term Accession Number") < 0 &&
            key.indexOf("Term Source REF") < 0
        );
        data["columns"] = columns;
        data["displayedColumns"] = displayedColumns;
        data["file"] = file;
        data.data.rows ? (data["rows"] = data.data.rows) : (data["rows"] = []);
        delete data.data;
        samples["data"] = data;
        this.ngRedux.dispatch({ type: "SET_STUDY_SAMPLES", body: samples });

        const organisms = {};
        data["rows"].forEach((row) => {
          let organismName = row["Characteristics[Organism]"] as string;
          organismName = organismName.replace(/^[ ]+|[ ]+$/g, "");

          const organismPart = row["Characteristics[Organism part]"];
          const organismVariant = row["Characteristics[Variant]"];
          if (organismName !== "" && organismName.replace(" ", "") !== "") {
            if (organisms[organismName] === null) {
              organisms[organismName] = {
                parts: [],
                variants: [],
              };
            } else {
              if (organisms[organismName]) {
                if (organisms[organismName].parts.indexOf(organismPart) < 0) {
                  organisms[organismName].parts.push(organismPart);
                }
                if (
                  organisms[organismName].variants.indexOf(organismVariant) < 0
                ) {
                  organisms[organismName].variants.push(organismVariant);
                }
              }
            }
          }
        });
        this.ngRedux.dispatch({
          type: "SET_STUDY_ORGANISMS",
          body: {
            organisms,
          },
        });
      },
      (err) => {}
    );
  }

  copyStudyFiles() {
    return this.dataService
      .copyFiles()
      .pipe(map(() => this.loadStudyFiles(true)));
  }

  syncStudyFiles(data) {
    return this.dataService
      .syncFiles(data)
      .pipe(map(() => this.loadStudyFiles(true)));
  }

  deleteProperties(data) {
    delete data.obfuscationCode;
    delete data.uploadPath;
    return data;
  }

  // Meta data
  saveTitle(body) {
    return this.dataService.saveTitle(body).pipe(
      map((data) => {
        this.ngRedux.dispatch({ type: "SET_STUDY_TITLE", body: data });
        return data;
      })
    );
  }

  saveAbstract(body) {
    return this.dataService.saveAbstract(body).pipe(
      map((data) => {
        this.ngRedux.dispatch({ type: "SET_STUDY_ABSTRACT", body: data });
        return data;
      })
    );
  }

  savePerson(body) {
    return this.dataService.savePerson(body).pipe(
      map((data) => {
        this.ngRedux.dispatch({
          type: "UPDATE_STUDY_PEOPLE",
          body: {
            people: data.contacts,
          },
        });
      })
    );
  }

  // People
  getPeople() {
    return this.dataService.getPeople().pipe(
      map((data) => {
        this.ngRedux.dispatch({
          type: "UPDATE_STUDY_PEOPLE",
          body: {
            people: data.contacts,
          },
        });
      })
    );
  }

  updatePerson(email, name, body) {
    return this.dataService.updatePerson(email, name, body);
  }

  makePersonSubmitter(email, study) {
    return this.dataService.makePersonSubmitter(email, study);
  }

  deletePerson(email, name) {
    return this.dataService.deletePerson(email, name);
  }

  // Ontology
  getOntologyTermDescription(value) {
    return this.dataService.getOntologyTermDescription(value);
  }


  getOntologyTerms(url): Observable<any> {
    if (this.defaultControlLists && url.indexOf("/ebi-internal/ontology") > 0) {
      let branch = "";
      const branchParam = url.split("branch=");
      if (branchParam.length > 1) {
        branch = decodeURI(branchParam[1]).split("&")[0];
      }
      let term = "";
      const termParam = url.split("term=");
      if (termParam.length > 1) {
        term = decodeURI(termParam[1].split("&")[0]);
      }
      let queryFields = "";
      const queryFieldsParam = url.split("queryFields=");
      if (queryFieldsParam.length > 1) {
        queryFields = decodeURI(queryFieldsParam[1].split("&")[0]);
      }
      if (queryFields.length === 0){
        if (term.length === 0 ) {
          if (branch.length > 0 && branch in this.defaultControlLists) {
            return of(this.defaultControlLists[branch]).pipe(
              observeOn(asapScheduler)
            );
          } else {
            console.log("Empty branch search and term search returns empty list.");
            return of({OntologyTerm: []}).pipe(
              observeOn(asapScheduler)
            );
          }
        } else {
          const lowerCaseTerm = term.toLowerCase();
          const containsFilter = (val: Ontology) => val.annotationValue.toLowerCase().indexOf(lowerCaseTerm) > -1;
          const startsWithFilter = (val: Ontology) => val.annotationValue.toLowerCase().startsWith(lowerCaseTerm);
          const exactMatchFilter = (val: Ontology) => val.annotationValue.toLowerCase() === lowerCaseTerm;

          const containsMatches = this.filterDefaultControlList(containsFilter, branch, term);
          const startsWithMatches = containsMatches.filter(startsWithFilter);
          const exactMatches = startsWithMatches.filter(exactMatchFilter);
          // const exactMatches = this.filterDefaultControlList(exactMatchFilter, branch, term);
          // const startsWithMatches = this.filterDefaultControlList(startsWithFilter, branch, term);
          const matchMap: Map<string, any> = new Map<string, any>();
          const filtereValues = [];
          exactMatches.forEach(element => {
            if (!matchMap.has(element.termAccession)){
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          startsWithMatches.forEach(element => {
            if (!matchMap.has(element.termAccession)){
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          containsMatches.forEach(element => {
            if (!matchMap.has(element.termAccession)){
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          if (filtereValues && filtereValues.length > 0){
            return of({OntologyTerm: filtereValues}).pipe(
              observeOn(asapScheduler)
            );
          }
        }
      }

    }
    return this.dataService.getOntologyTerms(url);
  }

  filterDefaultControlList(filter_method: CallableFunction, branch: string, term: string) {
      if (branch && branch.length > 0 && branch in this.defaultControlLists) {
          if (term && term.length > 0 ){
            return this.defaultControlLists[branch].OntologyTerm.filter(filter_method);
          } else {
            return this.defaultControlLists[branch].OntologyTerm;
          }
      }
      return [];
  }

  getOntologyDetails(value) {
    if (!this.ontologyDetails[value.termAccession]) {
      return this.dataService.getOntologyDetails(value).pipe(
        map((result) => {
          this.ontologyDetails[value.termAccession] = result;
          return result;
        })
      );
    } else {
      return of(this.ontologyDetails[value.termAccession]).pipe(
        observeOn(asapScheduler)
      );
    }

  }

  // Study Design Descriptors
  getDesignDescriptors() {
    return this.dataService.getDesignDescriptors();
  }

  saveDesignDescriptor(body) {
    return this.dataService.saveDesignDescriptor(body);
  }

  updateDesignDescriptor(annotationValue, body) {
    return this.dataService.updateDesignDescriptor(annotationValue, body);
  }

  deleteDesignDescriptor(annotationValue) {
    return this.dataService.deleteDesignDescriptor(annotationValue);
  }

  // Assays
  addAssay(body) {
    return this.dataService.addAssay(body).pipe(map((data) => data));
  }

  deleteAssay(name) {
    return this.dataService.deleteAssay(name).pipe(
      map((data) => {
        this.ngRedux.dispatch({ type: "DELETE_STUDY_ASSAY", body: name });
        return data;
      })
    );
  }

  // Protocols
  getProtocols(id) {
    return this.dataService.getProtocols(id).pipe(
      map((data) => {
        this.ngRedux.dispatch({ type: "SET_STUDY_PROTOCOLS", body: data });
        return data;
      })
    );
  }

  saveProtocol(body) {
    return this.dataService.saveProtocol(body);
  }

  updateProtocol(title, body) {
    return this.dataService.updateProtocol(title, body);
  }

  deleteProtocol(title) {
    return this.dataService.deleteProtocol(title);
  }

  // Ontology
  getExactMatchOntologyTerm(term, branch) {
    return this.dataService.getExactMatchOntologyTerm(term, branch);
  }

  // Study factors
  getFactors() {
    return this.dataService.getFactors().pipe(
      map((data) => {
        this.ngRedux.dispatch({
          type: "UPDATE_STUDY_FACTORS",
          body: {
            factors: data.factors,
          },
        });
        return data;
      })
    );
  }

  saveFactor(body) {
    return this.dataService.saveFactor(body);
  }

  updateFactor(factorName, body) {
    return this.dataService.updateFactor(factorName, body);
  }

  deleteFactor(factorName) {
    return this.dataService.deleteFactor(factorName);
  }

  // table
  addColumns(filename, body, tableType, metaInfo) {
    return this.dataService.addColumns(filename, body).pipe(
      map((data) => {
        this.updateTableState(filename, tableType, metaInfo);
        return data;
      })
    );
  }

  addRows(filename, body, tableType, metaInfo) {
    return this.dataService.addRows(filename, body).pipe(
      map((data) => {
        this.updateTableState(filename, tableType, metaInfo);
        return data;
      })
    );
  }

  updateRows(filename, body, tableType, metaInfo) {
    return this.dataService.updateRows(filename, body).pipe(
      map((data) => {
        this.updateTableState(filename, tableType, metaInfo);
        return data;
      })
    );
  }

  deleteRows(filename, rowIds, tableType, metaInfo) {
    return this.dataService.deleteRows(filename, rowIds).pipe(
      map((data) => {
        this.updateTableState(filename, tableType, metaInfo);
        return data;
      })
    );
  }

  updateCells(filename, body, tableType, metaInfo) {
    return this.dataService.updateCells(filename, body).pipe(
      map((result) => {
        // this.updateTableState(filename, tableType, metaInfo);
        this.commitUpdatedTableCells(filename, tableType, result);
        return result;
      })
    );
  }
  commitUpdatedTableCells(filename, tableType, result) {
    let source: any = {};
    let sourceFile: any = {};
    let fileExist = false;
    if (tableType === "samples") {
      source = this.study.samples;
      fileExist = this.study.samples.name === filename;
      sourceFile = fileExist ? source : "";
    } else if (tableType === "assays") {
      source = this.study.assays;
      fileExist = filename in source;
      sourceFile = fileExist ? source[filename] : "";
    } else if (tableType === "maf") {
      source = this.study.mafs;
      fileExist = filename in source;
      sourceFile = fileExist ? source[filename] : "";
    }
    if ( result.success && result.updates && result.updates.length > 0) {
      // console.log("committed values" + result.message);
      const table = sourceFile.data;
      const headerIndices: Map<number, string> = new Map<number, string>();
      table.columns.forEach((val, idx)=> {
        headerIndices.set(val.header, idx);
      });
      result.updates.forEach((update) => {
        const remoteHeader = result.header[update["column"]];
        const currentIndex = headerIndices.get(remoteHeader);
        const currentHeader = table.columns[currentIndex].columnDef;
        if (currentHeader === remoteHeader) {
          table.rows[update["row"]][currentHeader] = update["value"];
        } else {
          console.log("Value '" + update["value"] + "' at row "+ update["row"]
            + ". Update column names do not match. Remote header: "
            + remoteHeader + " current header: " + currentHeader);
        }
      });
    }
  }

  //Publications
  getPublications() {
    return this.dataService.getPublications().pipe(
      map((data) => {
        this.ngRedux.dispatch({
          type: "UPDATE_STUDY_PUBLICATIONS",
          body: {
            publications: data.publications,
          },
        });
        return data;
      })
    );
  }

  savePublication(body) {
    return this.dataService.savePublication(body);
  }

  updatePublication(title, body) {
    return this.dataService.updatePublication(title, body);
  }

  deletePublication(title) {
    return this.dataService.deletePublication(title);
  }

  //Status change
  changeStatus(status) {
    return this.dataService.changeStatus(status);
  }

  getStudyPrivateFolderAccess() {
    return this.dataService.getStudyPrivateFolderAccess();
  }

  toggleFolderAccess() {
    return this.dataService.toggleFolderAccess();
  }

  // Release date change
  changeReleasedate(releaseDate) {
    return this.dataService.changeReleasedate(releaseDate);
  }
}

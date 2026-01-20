import { inject, Injectable, isDevMode } from "@angular/core";
import { MetabolightsService } from "./../services/metabolights/metabolights.service";
import { AuthService } from "./../services/metabolights/auth.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { catchError, map, observeOn } from "rxjs/operators";
import { httpOptions, MtblsJwtPayload, MetabolightsUser, StudyPermission } from "./../services/headers";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "../configuration.service";
import jwtDecode from "jwt-decode";
import { MTBLSStudy } from "../models/mtbl/mtbls/mtbls-study";
import * as toastr from "toastr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, asapScheduler, firstValueFrom } from "rxjs";
import { PlatformLocation } from "@angular/common";
import { Ontology } from "../models/mtbl/mtbls/common/mtbls-ontology";
import { Store } from "@ngxs/store";
import { Loading, SetLoadingInfo } from "../ngxs-store/non-study/transitions/transitions.actions";
import { Owner, User } from "../ngxs-store/non-study/user/user.actions";
import { GetGeneralMetadata, Identifier, ResetGeneralMetadataState } from "../ngxs-store/study/general-metadata/general-metadata.actions";
import { GeneralMetadataState } from "../ngxs-store/study/general-metadata/general-metadata.state";
import { AssayState } from "../ngxs-store/study/assay/assay.state";
import { FilesState } from "../ngxs-store/study/files/files.state";
import { IStudyFiles } from "../models/mtbl/mtbls/interfaces/study-files.interface";
import { ValidationState } from "../ngxs-store/study/validation/validation.state";
import { BannerMessage, DefaultControlLists, MaintenanceMode, SetProtocolExpand } from "../ngxs-store/non-study/application/application.actions";
import { ApplicationState } from "../ngxs-store/non-study/application/application.state";
import { SampleState } from "../ngxs-store/study/samples/samples.state";
import { MAFState } from "../ngxs-store/study/maf/maf.state";
import { EditorValidationRules, ResetValidationState } from "../ngxs-store/study/validation/validation.actions";
import { Operations, ResetFilesState } from "../ngxs-store/study/files/files.actions";
import { ResetAssayState } from "../ngxs-store/study/assay/assay.actions";
import { ResetSamplesState, Samples } from "../ngxs-store/study/samples/samples.actions";
import { ValidationService } from "./decomposed/validation.service";
import { ResetDescriptorsState } from "../ngxs-store/study/descriptors/descriptors.action";
import { ResetMAFState } from "../ngxs-store/study/maf/maf.actions";
import { ResetProtocolsState } from "../ngxs-store/study/protocols/protocols.actions";
import { MetabolightsFieldControls } from "../models/mtbl/mtbls/control-list";

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

  studyIdentifier$: Observable<string> = this.store.select(GeneralMetadataState.id);
  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);
  editorValidationRules$: Observable<Record<string, any>> = inject(Store).select(ValidationState.rules);
  controlLists$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.controlLists);

  assays$: Observable<Record<string, any>> = inject(Store).select(AssayState.assays);
  samples$: Observable<Record<string, any>> = inject(Store).select(SampleState.samples);
  mafs$: Observable<Record<string, any>> = inject(Store).select(MAFState.mafs);

  toastrSettings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.toastrSettings);

  private assays: Record<string, any>;
  private samples: Record<string, any>;
  private mafs: Record<string, any>;
  private toastrSettings: Record<string, any> = {};

  study: MTBLSStudy;
  baseHref: string;
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
  // keep raw control-lists payload (may include assayFileControls/sampleFileControls/etc)
  controlListControls: MetabolightsFieldControls | null = null;
  // convenience references to specific parts (if present)
  controlListAssayRules: any = null;
  controlListSampleRules: any = null;
  controlListInvestigationRules: any = null;
  constructor(
    public store: Store,
    private router: Router,
    private authService: AuthService,
    private dataService: MetabolightsService,
    private validationService: ValidationService, // this is an antipattern, dont repeat
    public configService: ConfigurationService,
    private platformLocation: PlatformLocation,
    private http: HttpClient,
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
    this.setUpSubscriptionsNgxs();
    // load dev control-lists (asset) and merge into NGXS without overwriting existing controlLists
    // this.loadAndMergeDevControlLists();
  }

  private _redirectUrl: string = null;

  get redirectUrl(): string {
    if (this._redirectUrl) {
      return this._redirectUrl;
    }
    return this.configService.config ? this.configService.config.redirectURL : null;
  }

  set redirectUrl(value: string) {
    this._redirectUrl = value;
  }

  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((settings) => { this.toastrSettings = settings });
    this.studyIdentifier$.subscribe((value) => {
      this.currentStudyIdentifier = value;
    });
    this.editorValidationRules$.subscribe((value) => {
      this.validations = value;
    });
    this.studyFiles$.subscribe((value) => {
      this.files = value;
    });

    this.controlLists$.subscribe((value) => {
      // if (value) {
      //   Object.keys(value).forEach((label: string)=>{
      //     this.defaultControlLists[label] = {OntologyTerm: []};
      //     value[label].forEach(term => {
      //       this.defaultControlLists[label].OntologyTerm.push({
      //         annotationDefinition: term.definition,
      //         annotationValue: term.name,
      //         termAccession: term.iri,
      //         comments: [],
      //         termSource: {
      //           comments: [],
      //           name: term.onto_name,
      //           description: term.onto_name === "MTBLS" ? "Metabolights Ontology" : "",
      //           file: term.provenance_name,
      //           provenance_name: term.provenance_name,
      //           version: ""
      //         },
      //         wormsID: ""
      //       });
      //     });
      //   });
      // }
      if (!value) return;

      let controlListsPayload: Record<string, any> = value;
      if ((value as any).controlLists) {
        // store raw controls for other components to use
        this.controlListControls = value as MetabolightsFieldControls;
        this.controlListAssayRules = (value as any).assayFileControls || null;
        this.controlListSampleRules = (value as any).sampleFileControls || null;
        this.controlListInvestigationRules = (value as any).investigationFileControls || null;
        controlListsPayload = (value as any).controlLists || {};
      } else {
        this.controlListControls = null;
        this.controlListAssayRules = null;
        this.controlListSampleRules = null;
        this.controlListInvestigationRules = null;
      }
      // reset before rebuild to avoid accumulated entries on repeated emissions
      this.defaultControlLists = {};
      Object.keys(controlListsPayload).forEach((label: string) => {
        const entry: any = controlListsPayload[label];
        // support either: direct array of terms OR wrapper { OntologyTerm: [...] }
        const termsArray = Array.isArray(entry)
          ? entry
          : entry && Array.isArray(entry.OntologyTerm)
            ? entry.OntologyTerm
            : null;

        if (!termsArray) {
          // skip non-array entries
          return;
        }

        this.defaultControlLists[label] = { OntologyTerm: [] };
        termsArray.forEach((term: any) => {
          this.defaultControlLists[label].OntologyTerm.push({
            annotationDefinition: term.definition,
            annotationValue: term.name || term.annotationValue || "",
            termAccession: term.iri || term.termAccession || "",
            comments: [],
            termSource: {
              comments: [],
              name: term.onto_name || term.termSourceRef || "",
              description: (term.onto_name || term.termSourceRef) === "MTBLS" ? "Metabolights Ontology" : "",
              file: term.provenance_name || "",
              provenance_name: term.provenance_name || "",
              version: "",
            },
            wormsID: "",
          });
        });
      });
    });
    this.assays$.subscribe((assays) => this.assays = assays);
    this.samples$.subscribe((samples) => this.samples = samples);
    this.mafs$.subscribe((mafs) => this.mafs = mafs)

  }

//   private loadAndMergeDevControlLists(): void {
//   this.http.get<any>("/assets/control-lists.json").subscribe(
//     (assetLists) => {
//       try {
//         // Get the existing state snapshot safely
//         const existingState = this.store.selectSnapshot(ApplicationState.controlLists) || {};

//         // Normalize the incoming asset payload (in case some fields are missing)
//         const assetFull = assetLists?.controlLists
//           ? assetLists
//           : {
//               controlLists: assetLists?.controlLists || assetLists || {},
//               assayFileControls: assetLists?.assayFileControls || {},
//               sampleFileControls: assetLists?.sampleFileControls || {},
//               investigationFileControls: assetLists?.investigationFileControls || {},
//               defaultOntologies: assetLists?.defaultOntologies || [],
//               defaultOtherSources: assetLists?.defaultOtherSources || [],
//             };

//         // Create a new shallow-merged flat control list (immutable)
//         const mergedFlat = {
//           ...existingState.controlLists,
//           ...assetFull.controlLists,
//         };

//         // Create a new merged full payload (immutable)
//         const mergedFull = {
//           ...existingState,
//           ...assetFull,
//           controlLists: mergedFlat,
//         };

//         // Dispatch new immutable object → NGXS detects reference change
//         this.store.dispatch(new DefaultControlLists.Set(structuredClone(mergedFull)));

//       } catch (e) {
//         console.error("Error merging control lists:", e);
//         // Fallback: dispatch a minimal payload
//         const fallbackFull =
//           assetLists?.controlLists ? assetLists : { controlLists: assetLists || {} };
//         this.store.dispatch(new DefaultControlLists.Set(structuredClone(fallbackFull)));
//       }
//     },
//     (error) => {
//       console.warn("Dev control list file not found — skipping", error);
//       // Optional: handle gracefully
//     }
//   );
// }


  login(body) {
    return this.authService.login(body);
  }

  logout(redirect) {

    this.clearSessionData();
    if (this.configService.config.clearJavaSession && redirect) {
      window.location.href = this.configService.config.javaLogoutURL;
    } else {
      this.resetStudyStates();
      this.router.navigate([this.configService.config.loginURL]);
    }
  }

  resetStudyStates() {
    this.store.dispatch([
      new ResetGeneralMetadataState(),
      new ResetAssayState(),
      new ResetSamplesState(),
      new ResetMAFState(),
      new ResetProtocolsState(),
      new ResetDescriptorsState(),
      new ResetValidationState(),
      new ResetFilesState()
    ])
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

  // ADJUST POST STATE MIGRATION
  loadStudyInReview(id) {
    this.loadStudyId(id);
    this.loadStudyNgxs(id, true);
  }

  // ADJUST POST STATE MIGRATION
  loadPublicStudy(body) {
    this.loadStudyId(body.id);
    this.loadStudyNgxs(body.id, true);

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
        `${this.configService.config.ws3URL}/public/v2/validations/configuration`,
        {
          headers: new HttpHeaders({
              Accept: "application/json"
            }),
            observe: "body",
          }
      )
      .pipe(catchError(this.dataService.handleError));
  }

  checkMaintenanceMode(): Observable<any> {
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
      "one-time-token": oneTimeToken
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

  /**
   * Currently this breaks with state pattern and makes service calls, subsequently updating the state. I didn't want to tamper with any session related
   * functionality as this has been a pain point in the past.
   * @returns
   */
  async updateSession() {

    const jwtTokenKey = "jwt"
    // const jwtTokenKey = this.configService.config.endpoint + "/jwt"
    const userKey = this.configService.config.endpoint + "/user"

    const activeJwt = localStorage.getItem(jwtTokenKey);
    const localUser = localStorage.getItem(userKey);
    const user: MetabolightsUser = JSON.parse(localUser);

    if (environment.useNewState) {
      this.store.dispatch(new BannerMessage.Get());
      this.store.dispatch(new MaintenanceMode.Get());
      this.store.dispatch(new DefaultControlLists.Get());

    } else {
      this.getDefaultControlLists().subscribe({
        next: (response) => {
          this.store.dispatch(new DefaultControlLists.Set(response.content));
        },
        error: (error) => {
          this.store.dispatch(new DefaultControlLists.Set({}));

        }
      }
      );
      this.getBannerHeader().subscribe({
        next: (response) => {
          const message = response.content;
          this.store.dispatch(new BannerMessage.Set(message))
        },
        error: (error) => {
          this.store.dispatch(new BannerMessage.Set(null))
        }
      }
      );
      this.checkMaintenanceMode().subscribe({
        next: (response) => {
          const result = response.content;
          this.store.dispatch(new MaintenanceMode.Set(result));
        },
        error: (error) => {
          this.store.dispatch(new MaintenanceMode.Set(false));
        }
      });
    }



    if (activeJwt !== null) {
      const decoded = jwtDecode<MtblsJwtPayload>(activeJwt);
      const username = decoded.email;
      if (user === null || user.email !== username) {
        this.clearSessionData();
        await this.loginWithJwt(activeJwt, username);
        return true;
      } else {
        const isCuratorKey = this.configService.config.endpoint + "/isCurator"
        const usernameKey = this.configService.config.endpoint + "/username"
        const apiTokenKey = this.configService.config.endpoint + "/apiToken"
        const jwtExpirationTimeKey = this.configService.config.endpoint + "/jwtExpirationTime"

        const isCurator = user.role === 1 ? "true" : "false";
        localStorage.setItem(isCuratorKey, isCurator);
        const apiToken = user.apiToken ?? "";
        localStorage.setItem(apiTokenKey, apiToken);

        localStorage.setItem(usernameKey, user.email);
        localStorage.setItem(jwtExpirationTimeKey, decoded.exp.toString());
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
    if (window.location.pathname.startsWith("/")) {
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

  clearSessionData() {
    if (this.configService.config.endpoint) {
      // localStorage.removeItem(this.configService.config.endpoint + "/jwt");
      localStorage.removeItem("jwt");
      localStorage.removeItem(this.configService.config.endpoint + "/username");
      localStorage.removeItem(this.configService.config.endpoint + "/jwtExpirationTime");
      localStorage.removeItem(this.configService.config.endpoint + "/user");
      localStorage.removeItem(this.configService.config.endpoint + "/isCurator");
      localStorage.removeItem(this.configService.config.endpoint + "/userToken");
      localStorage.removeItem(this.configService.config.endpoint + "/apiToken");
      localStorage.removeItem(this.configService.config.endpoint + "/loginOneTimeToken");
    }

  }

  async loginWithJwt(jwtToken: string, userName: string) {
    const body = { jwt: jwtToken, user: userName };
    const url = this.configService.config.metabolightsWSURL.baseURL + this.configService.config.authenticationURL.initialise;
    const response = await firstValueFrom(this.authService.http.post(url, body, httpOptions));
    const decoded = jwtDecode<MtblsJwtPayload>(jwtToken);
    const expiration = decoded.exp;

    // const jwtKey = this.configService.config.endpoint + "/jwt"
    const jwtKey = "jwt"
    const usernameKey = this.configService.config.endpoint + "/username"
    const jwtExpirationTimeKey = this.configService.config.endpoint + "/jwtExpirationTime"

    localStorage.setItem(jwtKey, jwtToken);

    localStorage.setItem(usernameKey, userName);
    localStorage.setItem(jwtExpirationTimeKey, expiration.toString());
    return this.initialise(response, true);
  }

  // many new state pivots to remove in here
  initialise(data, signInRequest) {
    interface User {
      updatedAt: number;
      owner: { apiToken: string; role: string; email: string; status: string; partner: boolean; };
      message: string;
      err: string;
    }

    const userKey = this.configService.config.endpoint + "/user"
    const isCuratorKey = this.configService.config.endpoint + "/isCurator"
    if (signInRequest) {
      const user: Owner = data.content;
      if (user) {


        localStorage.setItem(userKey, JSON.stringify(user));
        const isCurator = user.role === 1 ? "true" : "false";
        localStorage.setItem(isCuratorKey, isCurator);
        httpOptions.headers = httpOptions.headers.set(
          "user-token",
          user.apiToken
        );

        this.store.dispatch(new User.Set(user));
      } else {
        this.clearSessionData()
      }
      this.store.dispatch(new User.Studies.Set(null))


      this.loadValidations();
      return true;
    } else {
      const user: Owner = JSON.parse(data);
      httpOptions.headers = httpOptions.headers.set(
        "user-token",
        disambiguateUserObj(user)
      );
      const isCurator = user.role === 1 ? "true" : "false";

      localStorage.setItem(isCuratorKey, isCurator);

      this.store.dispatch(new User.Set(user));


      this.store.dispatch(new User.Studies.Set(null))

      this.loadValidations();
      return true;
    }
  }

  /**
   * This method circumvents the state, but it is wired closely to app init and didn't want
   * anything to break.
   * @returns
   */
  loadValidations() {
    if (this.validations) {
      return;
    }

    this.validationService.getValidationRules().subscribe(
      (validations) => {
        this.store.dispatch(new SetLoadingInfo("Loading study validations"))
        this.store.dispatch(new EditorValidationRules.Set(validations))
      },
      (err) => {
        console.log(err);
      }
    );
  }

  loadStudyId(id) {
    if (id === null) {
      if (isDevMode()) console.trace();
    }
    this.store.dispatch(new Identifier.Set(id))
  }

  createStudy(payload: any = null) {
    if (payload) {
      return this.dataService.createStudyWithMetadata(payload);
    }
    return this.dataService.createStudy();
  }

  toggleLoading(status) {
    status !== null ? (
      status ? this.store.dispatch(new Loading.Enable()) : this.store.dispatch(new Loading.Disable())
    ) : this.store.dispatch(new Loading.Toggle())

  }

  initialiseStudy(route) {
    if (route === null) {
      return this.loadStudyId(null);
    } else {
      route.params.subscribe((params) => {
        const studyID = params.id;
        if (this.currentStudyIdentifier !== studyID) {
          this.loadStudyNgxs(studyID, false);
        }
      });
    }
  }

  // ADJUST POST STATE MIGRATION
  toggleProtocolsExpand(value) {
    this.store.dispatch(new SetProtocolExpand(value))
  }

  loadStudyNgxs(studyID, readonly) {
    this.toggleLoading(true);
    this.loadStudyId(studyID);
    this.store.dispatch(new GetGeneralMetadata(studyID, readonly))
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


  loadStudySamples(studyId: string) {
    if (this.files === null) {
      //this.store.dispatch(new Operations.GetFreshFilesList(false)) // causing issues currently
    } else {
      let samplesExist = false;
      this.files.study.forEach((file) => {
        if (file.file.indexOf("s_") === 0 && file.status === "active") {
          this.store.dispatch(new SetLoadingInfo("Loading samples data"))
          samplesExist = true;

          this.store.dispatch(new Samples.OrganiseAndPersist(file.file, studyId));
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

  loadStudySamplesWithoutPopup(studyId: string) {
    if (this.files === null) {
      //this.store.dispatch(new Operations.GetFreshFilesList(false)) // causing issues currently
    } else {
      let samplesExist = false;
      this.files.study.forEach((file) => {
        if (file.file.indexOf("s_") === 0 && file.status === "active") {
          // this.store.dispatch(new SetLoadingInfo("Loading samples data"))
          samplesExist = true;
          this.store.dispatch(new Samples.OrganiseAndPersist(file.file, studyId));
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

  search(term, type) {
    return this.dataService.search(term, type).pipe(map((data) => data));
  }

  validateMAF(f) {
    return this.dataService.validateMAF(f).pipe(map((data) => data));
  }


  copyStudyFiles() {
    return this.dataService
      .copyFiles()
      .pipe(map(() => this.store.dispatch(new Operations.GetFreshFilesList(true, false, this.currentStudyIdentifier))));
  }

  syncStudyFiles(data) {
    return this.dataService
      .syncFiles(data)
      .pipe(map(() => this.store.dispatch(new Operations.GetFreshFilesList(true, false, this.currentStudyIdentifier))));
  }

  deleteProperties(data) {
    delete data.obfuscationCode;
    delete data.uploadPath;
    return data;
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
      if (queryFields.length === 0) {
        if (term.length === 0) {
          if (branch.length > 0 && branch in this.defaultControlLists) {
            return of(this.defaultControlLists[branch]).pipe(
              observeOn(asapScheduler)
            );
          } else {
            console.log("Empty branch search and term search returns empty list.");
            return of({ OntologyTerm: [] }).pipe(
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
            if (!matchMap.has(element.termAccession)) {
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          startsWithMatches.forEach(element => {
            if (!matchMap.has(element.termAccession)) {
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          containsMatches.forEach(element => {
            if (!matchMap.has(element.termAccession)) {
              matchMap.set(element.termAccession, element);
              filtereValues.push(element);
            }
          });
          if (filtereValues && filtereValues.length > 0) {
            return of({ OntologyTerm: filtereValues }).pipe(
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
      if (term && term.length > 0) {
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


  // Ontology
  getExactMatchOntologyTerm(term, branch) {
    return this.dataService.getExactMatchOntologyTerm(term, branch);
  }


  commitUpdatedTablesCellsNgxs(filename, tableType, result): void {
    let source: any = {};
    let sourceFile: any = {};
    let fileExist = false;
    if (tableType === "samples") {
      source = this.samples;
      fileExist = this.samples.name === filename;
      sourceFile = fileExist ? source : "";
    } else if (tableType === "assays") {
      source = this.assays;
      fileExist = filename in source;
      sourceFile = fileExist ? source[filename] : "";
    } else if (tableType === "maf") {
      source = this.mafs;
      fileExist = filename in source;
      sourceFile = fileExist ? source[filename] : "";
    }
    if (result.success && result.updates && result.updates.length > 0) {
      const table = sourceFile.data;
      const deepCopiedData = JSON.parse(JSON.stringify(table));

      const headerIndices: Map<number, string> = new Map<number, string>();
      table.columns.forEach((val, idx) => {
        headerIndices.set(val.header, idx);
      });
      result.updates.forEach((update) => {
        const remoteHeader = result.header[update["column"]];
        const currentIndex = headerIndices.get(remoteHeader);
        const currentHeader = table.columns[currentIndex].columnDef;
        if (currentHeader === remoteHeader) {
          table.rows[update["row"]][currentHeader] = update["value"];
        } else {
          console.log("Value '" + update["value"] + "' at row " + update["row"]
            + ". Update column names do not match. Remote header: "
            + remoteHeader + " current header: " + currentHeader);
        }
      });
    }
  }


  getStudyPrivateFolderAccess() {
    return this.dataService.getStudyPrivateFolderAccess();
  }

  toggleFolderAccess() {
    return this.dataService.toggleFolderAccess();
  }
  copyContent(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      toastr.success("Content copied to clipboard", "Success", this.toastrSettings);
    }).catch((error) => {
      toastr.error("Failed to copy content: " + error, "Error", this.toastrSettings);
    });
  }

  getRorOrganizations(query: string): Observable<any> {
    if (!query || query.trim().length < 3) {
      // Avoid unnecessary API calls
      return of({ items: [] });
    }

    const encodedQuery = encodeURIComponent(query);

    const url = `https://www.ebi.ac.uk/ols4/api/search` +
      `?q=${encodedQuery}` +
      `&ontology=ror` +
      `&fieldList=ontology_prefix,iri,label,synonym,description` +
      `&queryFields=label,iri,synonym`;

    return this.dataService.getRorid(url);
  }

  // New method for ontology term search with rule-based validation
  searchOntologyTermsWithRuleV2(
    keyword: string,
    isExactMatchRequired: boolean,
    ruleName: string,
    fieldName: string,
    validationType: string,
    ontologies: string[],
    allowedParentOntologyTerms?: any
  ): Observable<any> {
    const body: any = {
      validationType: validationType,
      ontologies: ontologies,
      ruleName: ruleName,
      fieldName: fieldName
    };
    if (allowedParentOntologyTerms) {
      body.allowedParentOntologyTerms = allowedParentOntologyTerms;
    }
    return this.dataService.getOntologyTermsV2(keyword, isExactMatchRequired, body);
  }

  // Cache for identifier sources
  private identifierSourcesCache: any[] = null;

  getIdentifierSources(query: string): Observable<any> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    return this.fetchIdentifierSources().pipe(
        map(sources => {
             const lowerQuery = query.toLowerCase();
             return sources.filter(s =>
                 (s.name && s.name.toLowerCase().indexOf(lowerQuery) !== -1) ||
                 (s.prefix && s.prefix.toLowerCase().indexOf(lowerQuery) !== -1)
             ).slice(0, 50); 
        })
    );
  }

  private fetchIdentifierSources(): Observable<any[]> {
      if (this.identifierSourcesCache) {
          return of(this.identifierSourcesCache);
      }

      // Public endpoint returns full dataset (~2MB)
      const url = 'https://registry.api.identifiers.org/resolutionApi/getResolverDataset';
      return this.http.get<any>(url).pipe(
          map(response => {
              const namespaces = response.payload?.namespaces || [];
              return namespaces.map(ns => ({
                  prefix: ns.prefix,
                  name: ns.name,
                  description: ns.description,
                  sampleId: ns.sampleId, 
                  urlPattern: ns.resources?.[0]?.urlPattern || '' 
              })).filter(ns => ns.urlPattern); 
          }),
          map(sources => {
              this.identifierSourcesCache = sources;
              return sources;
          }),
          catchError(err => {
              console.error('Error fetching identifier sources', err);
              return of([]);
          })
      );
  }
}

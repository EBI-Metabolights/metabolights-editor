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
import { Loading } from "../ngxs-store/non-study/transitions/transitions.actions";
import { Owner, User } from "../ngxs-store/non-study/user/user.actions";
import { GetGeneralMetadata, Identifier, ResetGeneralMetadataState } from "../ngxs-store/study/general-metadata/general-metadata.actions";
import { GeneralMetadataState } from "../ngxs-store/study/general-metadata/general-metadata.state";
import { AssayState } from "../ngxs-store/study/assay/assay.state";
import { FilesState } from "../ngxs-store/study/files/files.state";
import { IStudyFiles } from "../models/mtbl/mtbls/interfaces/study-files.interface";
import { BackendVersion, BannerMessage, DefaultControlLists, EditorVersion, MaintenanceMode, SetProtocolExpand } from "../ngxs-store/non-study/application/application.actions";
import { ApplicationState } from "../ngxs-store/non-study/application/application.state";
import { SampleState } from "../ngxs-store/study/samples/samples.state";
import { MAFState } from "../ngxs-store/study/maf/maf.state";
import { ResetValidationState } from "../ngxs-store/study/validation/validation.actions";
import { Operations, ResetFilesState } from "../ngxs-store/study/files/files.actions";
import { ResetAssayState } from "../ngxs-store/study/assay/assay.actions";
import { ResetSamplesState, Samples } from "../ngxs-store/study/samples/samples.actions";
import { ResetDescriptorsState } from "../ngxs-store/study/descriptors/descriptors.action";
import { ResetMAFState } from "../ngxs-store/study/maf/maf.actions";
import { ResetProtocolsState } from "../ngxs-store/study/protocols/protocols.actions";
import { FieldValueValidation, getValidationRuleForField, IsaTabFileType, MetabolightsFieldControls, ValidationRuleSelectionInput } from "../models/mtbl/mtbls/control-list";
import { KeycloakService } from "keycloak-angular";
import { shouldSkipDefaultControlListsForPath } from "../utils/default-control-lists-route.util";

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

type EditorValidationRuleDefinition = {
  condition: "min" | "pattern" | "array_min" | "required";
  value: number | string;
  error: string;
  type?: string;
};

type EditorValidationDefinition = {
  label?: string;
  description?: string;
  placeholder?: string;
  "is-required"?: string;
  "recommended-ontologies"?: {
    "is-forced-ontology": string;
    ontology: {
      url: string;
      allowFreeText: boolean;
    };
  };
  rules: EditorValidationRuleDefinition[];
};

type InvestigationFieldContext = {
  assayTemplate?: string | null;
  protocolName?: string | null;
  sampleTemplate?: string | null;
  studyCategory?: string | null;
  studyCreatedAt?: string | Date | null;
  templateVersion?: string | null;
};

const DEFAULT_PROTOCOL_TITLES = [
  "Sample collection",
  "Extraction",
  "Chromatography",
  "Mass spectrometry",
  "NMR sample",
  "NMR spectroscopy",
  "NMR assay",
  "Data transformation",
  "Metabolite identification",
];

const INVESTIGATION_FIELD_OVERRIDES: Record<string, Partial<EditorValidationDefinition>> = {
  "Study Title": {
    description: "A title for the Study. Please use the same title as the first publication",
    placeholder: "Example: Metabolic study of Diabetes in Homo sapiens...",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 25,
        error: "Study title must be at least 25 characters long. Please use the same title as the first publication.",
        type: "string",
      },
    ],
  },
  "Study Description": {
    description: "A brief description of the study aims. Please use the abstract of the publication",
    placeholder: "Please provide a description of your experiment, why not use the abstract of your paper",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 200,
        error: "Study description must be at least 200 characters long. Please use the abstract of the publication.",
        type: "string",
      },
    ],
  },
  "Study Person Last Name": {
    label: "Last Name",
    description: "The last name/surname of the contact. e.g. Smith",
    placeholder: "Doe",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 2,
        error: "The last name/surname of the contact. This should be a minimum of 2 characters long",
        type: "string",
      },
    ],
  },
  "Study Person First Name": {
    label: "First Name",
    description: "The first name of the contact. e.g. Emma",
    placeholder: "Joe",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 2,
        error: "The first name of the contact. This should be a minimum of 2 characters long",
        type: "string",
      },
    ],
  },
  "Study Person Mid Initials": {
    label: "Middle Initials",
    description: "The middle names or initials of the contact. e.g. Anna, A.",
    placeholder: "M.",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 1,
        error: "The middle names or initials of the contact. This should be a minimum of 1 characters long",
        type: "string",
      },
    ],
  },
  "Study Person Roles": {
    label: "Roles",
    description: "The role of the contact in this Study.",
    placeholder: "Primary investigator",
    "is-required": "true",
    rules: [
      {
        condition: "array_min",
        value: 1,
        error: "Please provide a role for this contact.",
        type: "string",
      },
    ],
  },
  "Study Person ORCID": {
    label: "ORCID",
    description: "The ORCID identifier for this contact e.g. 0000-0001-8604-1732",
    placeholder: "ORCID",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[X0-9]$",
        error: "Please provide a valid ORCID for the contact. Format: '0000-0001-8604-1732'",
        type: "string",
      },
    ],
  },
  "Study Person Email": {
    label: "Email",
    description: "The (primary) email for this contact. e.g. emma.smith@university.ac.uk",
    placeholder: "joe.doe@gmail.com, joe.doe@university.ac.uk",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^(([^<>()\\[\\]\\\\.,;:\\s@\\\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\\\"]+)*)|(\\\".+\\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$",
        error: "Please provide a valid email address for the contact. eg:'name@something.somewhere'",
        type: "string",
      },
    ],
  },
  "Study Person Alternative Email": {
    label: "Alternative Email",
    description: "The alternative email for this contact. e.g. emma.smith@gmail.com",
    placeholder: "joe.doe@gmail.com, joe.doe@university.ac.uk",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^(([^<>()\\[\\]\\\\.,;:\\s@\\\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\\\"]+)*)|(\\\".+\\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$",
        error: "Please provide a valid email address for the contact. eg:'name@something.somewhere'",
        type: "string",
      },
    ],
  },
  "Study Person Phone": {
    label: "Phone",
    description: "An international phone number for this contact, if available.",
    placeholder: "+44 01223 494400, +1-202-555-0130",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 10,
        error: "Please provide an international phone number for this contact. This should be a minimum of 10 numbers long",
        type: "string",
      },
    ],
  },
  "Study Person Fax": {
    label: "Fax",
    description: "A fax number for this contact, if available.",
    placeholder: "+44 01223 494444, +1-202-555-0130",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 10,
        error: "Please provide an international Fax number for this contact. This should be a minimum of 10 numbers long",
        type: "string",
      },
    ],
  },
  "Study Person Address": {
    label: "Address",
    description: "The (primary) address for this contact. e.g. 12 Street, Place, Postcode, Country",
    placeholder: "12 Street, Place, postcode, Country",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 30,
        error: "Please provide a primary address for this contact. This should be a minimum of 30 characters long",
        type: "string",
      },
    ],
  },
  "Study Person Affiliation": {
    label: "Affiliation",
    description: "The (primary) affiliation, institution or organisation for this contact. e.g. European Bioinformatics Institute",
    placeholder: "Institute or Company Name",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 10,
        error: "Please provide an institutional affiliation for this contact. This should be a minimum of 10 characters long",
        type: "string",
      },
    ],
  },
  "Study Person Affiliation ROR ID": {
    label: "ROR ID",
    description: "The ROR identifier of affiliation for this contact e.g. https://ror.org/02catss52",
    placeholder: "eg: https://ror.org/02catss52",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^(https:\\/\\/ror\\.org\\/[0-9a-z]{9}|https:\\/\\/www\\.wikidata\\.org\\/wiki\\/Q[1-9][0-9]{0,19})$",
        error: "Please provide a valid affiliation Research Organization Registry (ROR) Id. Format: 'https://ror.org/02catss52'",
        type: "string",
      },
    ],
  },
  "Study Publication Title": {
    label: "Publication Title",
    description: "The title of the publication",
    placeholder: "The multifunctional enzyme ....",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 20,
        error: "Please provide the (tentative) title of your publication. This should be a minimum of 20 characters long",
        type: "string",
      },
    ],
  },
  "Study Publication Author List": {
    label: "Author List",
    description: "The authors who contributed to this publication. As appears in the publication, do not include affiliation",
    placeholder: "Joe Doe, Jane Doe,....",
    "is-required": "false",
    rules: [
      {
        condition: "min",
        value: 10,
        error: "Please provide a list of authors, separated by commas. As appears in the publication, do not include affiliation",
        type: "string",
      },
    ],
  },
  "Study Publication DOI": {
    label: "Publication DOI",
    description: "The DOI related to this publication if available (eg. 10.1111/111111)",
    placeholder: "10.1105/tpc.109.066670",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^10[.].+/.+$",
        error: "Please only provide the DOI, not the URL/http address",
        type: "string",
      },
    ],
  },
  "Study PubMed ID": {
    label: "PubMed ID",
    description: "The PubMed ID related to this publication if available (eg.18181111)",
    placeholder: "19567706",
    "is-required": "false",
    rules: [
      {
        condition: "pattern",
        value: "^[1-9]([0-9]{1,8})?$",
        error: "Please only provide the id number, not prefixed with PMID:",
        type: "integer",
      },
    ],
  },
  "Study Publication Status": {
    label: "Publication Status",
    description: "The status of this publication (e.g. published, in preparation)",
    placeholder: "in preparation, published, etc",
    "is-required": "true",
    rules: [
      {
        condition: "array_min",
        value: 1,
        error: "Please provide the publication status of your publication.",
        type: "string",
      },
    ],
  },
  "Study Protocol Name": {
    label: "Protocol Name",
    description: "The descriptive name of the protocol.",
    placeholder: "Protocol name",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 8,
        error: "Please provide the name of your protocol. This should be a minimum of 8 characters long",
        type: "string",
      },
    ],
  },
  "Study Protocol Description": {
    label: "Protocol Description",
    description: "A brief description of the protocol. Please use the protocol reported in the publication",
    placeholder: "Protocol description",
    "is-required": "true",
    rules: [
      {
        condition: "min",
        value: 40,
        error: "Study protocol description should be at least 40 characters long. Please use the protocol reported in the publication",
        type: "string",
      },
    ],
  },
  "Study Protocol URI": {
    label: "Protocol URI",
    description: "The URI for the protocol if available.",
    placeholder: "https://...",
    "is-required": "false",
    rules: [],
  },
  "Study Protocol Version": {
    label: "Protocol Version",
    description: "The version of the protocol if available.",
    placeholder: "1.0",
    "is-required": "false",
    rules: [],
  },
  "Study Protocol Parameter Name": {
    label: "Protocol Parameter Name",
    description: "Add a parameter name for this protocol.",
    placeholder: "Post Extraction / Derivatization",
    "is-required": "true",
    rules: [
      {
        condition: "array_min",
        value: 1,
        error: "Please provide a protocol parameter name.",
        type: "string",
      },
    ],
  },
};

const LEGACY_UI_FIELD_OVERRIDES: Record<string, Record<string, any>> = {
  "__root__": {
    studyDesignDescriptors: {
      label: "Study Design Descriptors",
      "is-required": "true",
      description:
        "Add keywords describing study design, biological context, analytical approach e.g., Celiac disease, ultra-performance liquid chromatography-mass spectrometry, targeted or untargeted metabolites",
      placeholder: "Metabolomics, Lipidomics",
      rules: [
        {
          condition: "min",
          value: 5,
          error:
            "Please provide a valid ontology term for the factor. This should be a minimum of 5 characters long",
          type: "string",
        },
      ],
      "recommended-ontologies": {
        "is-forced-ontology": "false",
        ontology: {
          url: "/ebi-internal/ontology?branch=Study%20Design%20Type&term=",
          allowFreeText: true,
        },
      },
    },
    assayDesignDescriptors: {
      label: "Assay Design Descriptors",
      "is-required": "false",
      description:
        "Add keywords describing assay design, instrument settings, analysis approach e.g., data-independent acquisition, collision-induced dissociation, ion mobility, profile spectrum",
      placeholder: "Metabolomics, Lipidomics",
      rules: [
        {
          condition: "min",
          value: 5,
          error:
            "Please provide a valid ontology term for the factor. This should be a minimum of 5 characters long",
          type: "string",
        },
      ],
      "recommended-ontologies": {
        "is-forced-ontology": "false",
        ontology: {
          url: "/ebi-internal/ontology?branch=Study%20Design%20Type&term=",
          allowFreeText: true,
        },
      },
    },
  },
  "factors.factor": {
    "Study Factor Name": {
      label: "Factor Name",
      "is-required": "false",
      description:
        "The name of the Factor driving this study, e.g. (Factor name: BMI and factor type: EFO:body mass index), (Factor name: Biological replicate, Factor type EFO:biological replicate) so forth",
      placeholder: "Dose, Genotype, Collection time point",
      rules: [
        {
          condition: "min",
          value: 5,
          error:
            "Please provide an descrition of the factor. This should be a minimum of 5 characters long",
          type: "string",
        },
      ],
    },
    "Study Factor Type": {
      label: "Factor Type",
      "is-required": "true",
      description:
        "The type of the Factor driving this study, e.g. EFO:Dose (from Ontology), etc.",
      placeholder: "EFO:Dose",
      rules: [
        {
          condition: "min",
          value: 5,
          error:
            "Please provide a valid ontology term for the factor. This should be a minimum of 5 characters long",
          type: "string",
        },
      ],
      "recommended-ontologies": {
        "is-forced-ontology": "false",
        ontology: {
          url: "/ebi-internal/ontology?branch=Study%20Factor%20Type&term=",
          allowFreeText: true,
        },
      },
    },
  },
  samples: {
    category: {
      label: "Characteristic",
      "is-required": "true",
      description:
        "Characteristic category type other than Organism, Organism part, Variant and Sample type. ",
      placeholder: "Example: Organism, Organism part, Variant",
      rules: [],
      "recommended-ontologies": {
        "is-forced-ontology": "false",
        ontology: {
          url: "/ebi-internal/ontology?branch=Characteristics&term=",
          allowFreeText: true,
        },
      },
    },
    unit: {
      label: "Add unit (if applicable)",
      "is-required": "false",
      description: "Example: hour, percent, microliter etc.",
      placeholder: "hour, percent, UO:microliter etc.",
      rules: [],
      "recommended-ontologies": {
        "is-forced-ontology": "false",
        ontology: {
          url: "/ebi-internal/ontology?branch=unit&term=",
          allowFreeText: true,
        },
      },
    },
    samples: {
      label: "New sample names",
      "is-required": "true",
      description:
        "Please add sample names one per each line or add coma separated values",
      placeholder: "Sample1, Sample2 ...",
      rules: [],
    },
  },
};

@Injectable({
  providedIn: "root",
})
export class EditorService {

  studyIdentifier$: Observable<string> = this.store.select(GeneralMetadataState.id);
  studyFiles$: Observable<IStudyFiles> = inject(Store).select(FilesState.files);
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
  private _redirectUrl = "";

  currentStudyIdentifier: string = null;
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
    public configService: ConfigurationService,
    private platformLocation: PlatformLocation,
    private http: HttpClient,
    private keycloak: KeycloakService
  ) {
    this.baseHref = this.platformLocation.getBaseHrefFromDOM();
    this.setUpSubscriptionsNgxs();
    // this.redirectUrl = this.configService.config.redirectURL;
    // this.setRedirectUrl(this.configService.config.redirectURL);
    // load dev control-lists (asset) and merge into NGXS without overwriting existing controlLists
    // this.loadAndMergeDevControlLists();
  }
  private getRedirectUrlKey(): string {
    const endpoint = this.configService.config?.endpoint || "";
    return `${endpoint}/RedirectUrl`;
  }
  
  isHighValueUrl(url: string): boolean {
    if (!url) return false;
    const upperUrl = url.toUpperCase();
    return upperUrl.includes('MTBLS') || upperUrl.includes('REQ') || upperUrl.includes('/STUDY/');
  }

  setRedirectUrl(newRedirectUrl) {
    if (!newRedirectUrl || newRedirectUrl.length === 0) {
      return;
    }

    const defaultRedirect = this.configService.config?.redirectURL || "";
    const isHighValue = this.isHighValueUrl(newRedirectUrl);
    
    // Skip if it's the default redirect page
    if (newRedirectUrl.startsWith(defaultRedirect)) {
       return;
    }

    const currentSaved = localStorage.getItem(this.getRedirectUrlKey());
    const currentIsHighValue = this.isHighValueUrl(currentSaved);

    // If we have a high-value URL already, don't overwrite it with a generic one (like '/' or '/console')
    if (currentIsHighValue && !isHighValue) {
       return;
    }

    // Otherwise, save it
    localStorage.setItem(this.getRedirectUrlKey(), newRedirectUrl);
  }

  get redirectUrl(): string {
    return this.getRedirectUrl();
  }
  set redirectUrl(newRedirectUrl: string) {
    this.setRedirectUrl(newRedirectUrl);
    this._redirectUrl = this.getRedirectUrl();
  }
  getRedirectUrl() {
    this._redirectUrl = localStorage.getItem(this.getRedirectUrlKey());
    if (!this._redirectUrl) {
      return this.configService.config?.redirectURL || "";
    }
    return this._redirectUrl
  }
  resetRedirectUrl() {
    if (this.configService.config?.redirectURL) {
      localStorage.setItem(this.getRedirectUrlKey(), this.configService.config.redirectURL);
    }
  }
  setUpSubscriptionsNgxs() {
    this.toastrSettings$.subscribe((settings) => { this.toastrSettings = settings });
    this.studyIdentifier$.subscribe((value) => {
      this.currentStudyIdentifier = value;
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
    this.resetStudyStates()
    this.keycloak.logout(this.configService.config.auth.logoutUrl)
    // if (this.configService.config.clearJavaSession && redirect) {
    //   window.location.href = this.configService.config.javaLogoutURL;
    // } else {
    //   this.resetStudyStates();
    //   this.router.navigate([this.configService.config.loginURL]);
    // }
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

    this.store.dispatch(new BackendVersion.Get());
    this.store.dispatch(new EditorVersion.Get());
    this.store.dispatch(new BannerMessage.Get());
    this.store.dispatch(new MaintenanceMode.Get());
    void this.loadDefaultControlLists();
    this.store.dispatch(new User.Studies.Set(null))
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

  loadDefaultControlLists() {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : this.router.url;

    if (shouldSkipDefaultControlListsForPath(currentPath)) {
      return Promise.resolve();
    }

    return this.store.dispatch(new DefaultControlLists.Get()).toPromise();
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
    if (value && value.termSource && (value.termSource.name === 'MTBLS' || value.termSource.name === 'Metabolights')) {
      return of(value);
    }
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
      `?q=${encodedQuery}*` +
      `&ontology=ror` +
      `&fieldList=ontology_prefix,iri,label,synonym,related_synonyms,description`;

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
          pattern: ns.pattern || '',
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

  private cloneValidationRules(rules: EditorValidationRuleDefinition[] = []): EditorValidationRuleDefinition[] {
    return rules.map((rule) => ({ ...rule }));
  }

  private cloneValidationDefinition(validation?: Partial<EditorValidationDefinition> | null): EditorValidationDefinition {
    return {
      label: validation?.label || "",
      description: validation?.description || "",
      placeholder: validation?.placeholder || "",
      "is-required": validation?.["is-required"] || "false",
      "recommended-ontologies": validation?.["recommended-ontologies"]
        ? JSON.parse(JSON.stringify(validation["recommended-ontologies"]))
        : undefined,
      rules: this.cloneValidationRules(validation?.rules || []),
    };
  }

  private normalizeLookupKey(value: string | null | undefined): string {
    return (value || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  }

  private resolveTemplateVersion(templateVersion?: string | null): string | null {
    const templateConfiguration = this.store.selectSnapshot(ApplicationState.templateConfiguration) as any;
    return (
      templateVersion ||
      this.store.selectSnapshot(GeneralMetadataState.templateVersion) ||
      templateConfiguration?.defaultTemplateVersion ||
      null
    );
  }

  private getInvestigationSelectionInput(context: InvestigationFieldContext = {}): ValidationRuleSelectionInput {
    const studyCreatedAt = context.studyCreatedAt
      ? new Date(context.studyCreatedAt)
      : null;

    return {
      studyCategory: (context.studyCategory as any) || null,
      studyCreatedAt,
      isaFileType: "investigation",
      isaFileTemplateName: null,
      templateVersion: this.resolveTemplateVersion(context.templateVersion),
    };
  }

  private getControlMapKey(fileType: IsaTabFileType): "assayFileControls" | "sampleFileControls" | "investigationFileControls" | "assignmentFileControls" {
    switch (fileType) {
      case "assay":
        return "assayFileControls";
      case "sample":
        return "sampleFileControls";
      case "investigation":
        return "investigationFileControls";
      case "maf":
      default:
        return "assignmentFileControls";
    }
  }

  private getFieldCandidates(fieldName: string): string[] {
    const formattedFieldName = (fieldName || "").replace(/\.[0-9]+$/, "").trim();
    let innerName = formattedFieldName;
    const match = formattedFieldName.match(/\[(.*?)\]/);
    if (match) {
      innerName = match[1]?.trim() || formattedFieldName;
    }

    return Array.from(
      new Set(
        [fieldName, formattedFieldName, innerName]
          .map((candidate) => (candidate || "").trim())
          .filter((candidate) => candidate.length > 0)
      )
    );
  }

  private getFileSelectionInput(
    fileType: IsaTabFileType,
    templateName?: string | null,
    context: InvestigationFieldContext = {}
  ): ValidationRuleSelectionInput {
    const resolvedTemplateName =
      templateName ||
      (fileType === "sample"
        ? context.sampleTemplate || this.store.selectSnapshot(GeneralMetadataState.sampleTemplate)
        : context.assayTemplate || null);

    return {
      studyCategory: (context.studyCategory as any) || null,
      studyCreatedAt: context.studyCreatedAt ? new Date(context.studyCreatedAt) : null,
      isaFileType: fileType,
      isaFileTemplateName: resolvedTemplateName,
      templateVersion: this.resolveTemplateVersion(context.templateVersion),
    };
  }

  getFieldControlRule(
    fieldName: string,
    fileType: IsaTabFileType,
    templateName?: string | null,
    context: InvestigationFieldContext = {}
  ): FieldValueValidation | null {
    const controlLists = this.store.selectSnapshot(ApplicationState.controlLists);
    const controlMapKey = this.getControlMapKey(fileType);
    const controlMap = controlLists?.controls?.[controlMapKey] || {};

    if (!controlLists?.controls) {
      return null;
    }

    const selectionInput = this.getFileSelectionInput(fileType, templateName, context);
    const candidates = this.getFieldCandidates(fieldName);

    try {
      for (const candidate of candidates) {
        const rule = getValidationRuleForField(
          { controlLists } as MetabolightsFieldControls,
          candidate,
          selectionInput
        );
        if (rule) {
          return rule;
        }
      }
    } catch (error) {
      console.warn(`Unable to resolve ${fileType} control rule for ${fieldName}`, error);
    }

    for (const candidate of candidates) {
      const rules = controlMap?.[candidate];
      if (Array.isArray(rules) && rules.length > 0) {
        return rules[0];
      }
    }

    return null;
  }

  getFieldValidation(
    fieldName: string,
    fileType: IsaTabFileType,
    templateName?: string | null,
    context: InvestigationFieldContext = {},
    fallbackToLegacyStore: boolean = false,
    validationsId?: string
  ): EditorValidationDefinition {
    const metadata =
      this.getFieldMetadata(
        fieldName,
        fileType,
        templateName,
        validationsId,
        fallbackToLegacyStore
      ) || {};
    const rule = this.getFieldControlRule(fieldName, fileType, templateName, context);

    const validation = this.cloneValidationDefinition({
      label: metadata.label || metadata.columnHeader || metadata.fieldName || fieldName,
      description: metadata.combinedDescription || metadata.description || "",
      placeholder: metadata.placeholder || metadata.columnHeader || metadata.fieldName || fieldName,
      "recommended-ontologies": metadata["recommended-ontologies"],
      "is-required":
        metadata.required === true || rule?.termEnforcementLevel === "required"
          ? "true"
          : "false",
      rules: Array.isArray(metadata.rules) ? metadata.rules : [],
    });

    if (rule) {
      validation["recommended-ontologies"] = this.buildOntologyValidationConfig(fieldName, rule);
    }

    return validation;
  }

  private getInvestigationControlRule(fieldName: string, context: InvestigationFieldContext = {}): FieldValueValidation | null {
    const controlLists = this.store.selectSnapshot(ApplicationState.controlLists);
    if (!controlLists?.controls) {
      return null;
    }

    try {
      return getValidationRuleForField(
        { controlLists } as MetabolightsFieldControls,
        fieldName,
        this.getInvestigationSelectionInput(context)
      );
    } catch (error) {
      console.warn(`Unable to resolve investigation control rule for ${fieldName}`, error);
      return null;
    }
  }

  private buildOntologyValidationConfig(fieldName: string, controlRule: FieldValueValidation | null) {
    if (!controlRule) {
      return undefined;
    }

    const forcedOntology = controlRule.termEnforcementLevel === "required";
    const branchUrl = controlRule.validationType === "selected-ontology-term"
      ? `/ebi-internal/ontology?branch=${encodeURIComponent(fieldName)}&term=`
      : "/ebi-internal/ontology?term=";

    return {
      "is-forced-ontology": forcedOntology ? "true" : "false",
      ontology: {
        url: branchUrl,
        allowFreeText: !forcedOntology,
      },
    };
  }

  private getProtocolTemplates(): Record<string, any[]> {
    return ((this.store.selectSnapshot(ApplicationState.protocolTemplates) as unknown) as Record<string, any[]>) || {};
  }

  private resolveProtocolTemplateKeys(assayTemplate?: string | null): string[] {
    const protocolTemplates = this.getProtocolTemplates();
    const keys = Object.keys(protocolTemplates);

    if (!assayTemplate) {
      return keys;
    }

    const normalizedTemplate = this.normalizeLookupKey(assayTemplate);
    const matchingKey = keys.find((key) => this.normalizeLookupKey(key) === normalizedTemplate);

    return matchingKey ? [matchingKey] : keys;
  }

  private getProtocolTemplateDefinition(templateName: string): any | null {
    const protocolTemplates = this.getProtocolTemplates();
    const templates = protocolTemplates[templateName];
    if (!Array.isArray(templates) || templates.length === 0) {
      return null;
    }

    const templateVersion = this.resolveTemplateVersion();
    return templates.find((template) => String(template.version) === String(templateVersion)) || templates[0] || null;
  }

  getDefaultProtocolNames(assayTemplate?: string | null): string[] {
    const orderedNames: string[] = [];
    const seen = new Set<string>();

    const pushName = (name: string) => {
      const normalized = this.normalizeLookupKey(name);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      orderedNames.push(name);
    };

    if (assayTemplate) {
      const templateKey = this.resolveProtocolTemplateKeys(assayTemplate)[0];
      const template = templateKey ? this.getProtocolTemplateDefinition(templateKey) : null;
      (template?.protocols || []).forEach((name: string) => pushName(name));
      if (orderedNames.length > 0) {
        return orderedNames;
      }
    }

    DEFAULT_PROTOCOL_TITLES.forEach((name) => pushName(name));
    this.resolveProtocolTemplateKeys().forEach((templateKey) => {
      const template = this.getProtocolTemplateDefinition(templateKey);
      (template?.protocols || []).forEach((name: string) => pushName(name));
    });

    return orderedNames;
  }

  private getProtocolDefinition(protocolName?: string | null, assayTemplate?: string | null): any | null {
    if (!protocolName) {
      return null;
    }

    const normalizedProtocolName = this.normalizeLookupKey(protocolName);
    for (const templateKey of this.resolveProtocolTemplateKeys(assayTemplate)) {
      const template = this.getProtocolTemplateDefinition(templateKey);
      const definitions = template?.protocolDefinitions || {};
      const matchingKey = Object.keys(definitions).find(
        (definitionKey) => this.normalizeLookupKey(definitionKey) === normalizedProtocolName
      );

      if (matchingKey) {
        return definitions[matchingKey];
      }
    }

    return null;
  }

  getInvestigationFieldValidation(fieldName: string, context: InvestigationFieldContext = {}): EditorValidationDefinition {
    const override = this.cloneValidationDefinition(INVESTIGATION_FIELD_OVERRIDES[fieldName]);
    const controlRule = this.getInvestigationControlRule(fieldName, context);
    const metadata = this.getFieldMetadata(fieldName, "investigation", null, undefined, false) || {};
    const protocolDefinition = fieldName === "Study Protocol Description"
      ? this.getProtocolDefinition(context.protocolName, context.assayTemplate)
      : null;

    const validation = this.cloneValidationDefinition({
      label: override.label || metadata.label || fieldName,
      description: protocolDefinition?.description || override.description || metadata.combinedDescription || metadata.description || "",
      placeholder: override.placeholder || metadata.placeholder || fieldName,
      "is-required": override["is-required"] || (metadata.required ? "true" : "false"),
      rules: override.rules || [],
      "recommended-ontologies": override["recommended-ontologies"],
    });

    if (controlRule) {
      validation["recommended-ontologies"] = validation["recommended-ontologies"] || this.buildOntologyValidationConfig(fieldName, controlRule);
      if (validation["is-required"] !== "true" && controlRule.termEnforcementLevel === "required") {
        validation["is-required"] = "true";
      }
    }

    if (validation.rules.length === 0 && typeof metadata.minLength === "number" && metadata.minLength > 0) {
      validation.rules.push({
        condition: "min",
        value: metadata.minLength,
        error: `${validation.label || fieldName} must be at least ${metadata.minLength} characters long.`,
        type: "string",
      });
    }

    return validation;
  }
  /**
   * Fetches field metadata from templateConfiguration, combining description and examples,
   * and capturing other properties like required, columnStructure, etc.
   * 
   * @param fieldName The name of the field (e.g., column header or property name)
   * @param fileType The type of file (assay, sample, investigation, maf)
   * @param templateName Optional template name (e.g., assay type or investigation template)
   */
  getFieldMetadata(fieldName: string, type?: IsaTabFileType, templateName?: string, validationsId?: string, fallbackToLegacyStore: boolean = true) {
    const applicationTemplates = this.store.selectSnapshot(ApplicationState.applicationTemplates);
    const config = this.store.selectSnapshot(ApplicationState.templateConfiguration) as any;
    const version = this.store.selectSnapshot(GeneralMetadataState.templateVersion);

    let fieldDef: any = null;
    const fileType = type || null;

    if (!config) return null;

    const strippedFieldName = fieldName?.replace(/\.[0-9]+$/, "").trim();

    const versionConfig = config.versions?.[version];

    // 1. Search in File Header Templates (Assay, Sample, MAF)
    if (fileType && (fileType === 'assay' || fileType === 'sample' || fileType === 'maf')) {
      let templates = null;
      if (fileType === 'assay') templates = applicationTemplates?.assayFileHeaderTemplates;
      if (fileType === 'sample') templates = applicationTemplates?.sampleFileHeaderTemplates;
      if (fileType === 'maf') templates = applicationTemplates?.assignmentFileHeaderTemplates;

      if (templates) {
        let headersList = null;
        if (templateName) {
          headersList = templates[templateName];
          if (!headersList) {
            const matchingKey = Object.keys(templates).find(k => {
              const normalizedK = k.toLowerCase().replace(/[-_ ]/g, "");
              const normalizedT = templateName.toLowerCase().replace(/[-_ ]/g, "");
              return normalizedK === normalizedT;
            });
            if (matchingKey) headersList = templates[matchingKey];
          }
        }

        const findInTemplate = (t) => {
          if (!t || !t.headers) return null;
          const target = strippedFieldName.toLowerCase();

          // Check for suffix like .1, .2 to find the N-th occurrence
          const suffixMatch = fieldName?.match(/\.([0-9]+)$/);
          const occurrenceIndex = suffixMatch ? parseInt(suffixMatch[1], 10) : 0;

          const matches = t.headers.filter(h => {
            const head = (h.columnHeader || h.fieldName || h.label || "")?.trim().toLowerCase();
            if (head === target) return true;
            // Try Param/Char/Factor variants
            const paramValueHeader = `parameter value[${target}]`;
            const charValueHeader = `characteristic[${target}]`;
            const factorValueHeader = `factor value[${target}]`;
            return head === paramValueHeader || head === charValueHeader || head === factorValueHeader;
          });

          if (matches.length > occurrenceIndex) {
            return matches[occurrenceIndex];
          }
          return matches.length > 0 ? matches[0] : null;
        };

        if (headersList) {
          const template = headersList.find(t => String(t.version) === String(version)) || (headersList.length > 0 ? headersList[0] : null);
          if (template) {
            fieldDef = findInTemplate(template);
          }
        } else {
          // Search across all templates for this file type
          for (const key of Object.keys(templates)) {
            const list = templates[key];
            const template = list.find(t => String(t.version) === String(version)) || (list.length > 0 ? list[0] : null);
            if (template) {
              fieldDef = findInTemplate(template);
              if (fieldDef) break;
            }
          }
        }
      }
    }

    // 2. Search in Investigation Templates if not found or if investigation fileType
    if (!fieldDef && (fileType === 'investigation' || !fileType)) {
      const invTemplates = applicationTemplates?.investigationFileTemplates;
      if (invTemplates) {
        // Search in all investigation templates
        for (const key of Object.keys(invTemplates)) {
          const list = invTemplates[key];
          const template = list.find(t => String(t.version) === String(version)) || (list.length > 0 ? list[0] : null);
          if (template && template.fields) {
            const target = strippedFieldName.toLowerCase();
            fieldDef = template.fields.find(f => {
              const field = (f.fieldName || "")?.trim().toLowerCase();
              const label = (f.label || "")?.trim().toLowerCase();
              const header = (f.columnHeader || "")?.trim().toLowerCase();
              return field === target || label === target || header === target;
            });
            if (fieldDef) break;
          }
        }
      }
    }

    // 3. Fallback to general configuration metadata (measurementTypes, omicsTypes, etc.)
    // 3. Fallback to general configuration metadata (measurementTypes, omicsTypes, etc.) if still no match OR if match has no description
    if (!fieldDef || !fieldDef.description) {
      // Search in measurementTypes, omicsTypes, studyCategories, etc. in root config
      const categories = ['measurementTypes', 'omicsTypes', 'studyCategories', 'sampleFileTemplates', 'investigationFileTemplates'];
      for (const cat of categories) {
        if (config[cat] && config[cat][fieldName]) {
          const catMatch = config[cat][fieldName];
          if (!fieldDef) {
            fieldDef = catMatch;
          } else if (catMatch.description) {
            // If template match was found but has no description, use description from global cat if available
            fieldDef = { ...fieldDef, description: catMatch.description, examples: catMatch.examples || fieldDef.examples };
          }
          break;
        }
      }
    }

    // 4. Fallback to small frontend legacy definitions if still not found
    if (!fieldDef && fallbackToLegacyStore) {
      fieldDef = this.getLegacyUiValidationDefinition(fieldName, validationsId);
    }

    if (!fieldDef) return null;

    // Process and combine description and examples
    const description = fieldDef.description || '';
    const examples = fieldDef.examples || '';
    let combinedDescription = description;
    if (examples) {
      let examplesStr = '';
      if (Array.isArray(examples)) {
        examplesStr = examples.map(e => (typeof e === 'object' ? JSON.stringify(e) : String(e))).filter(e => e.trim()).join(', ');
      } else {
        examplesStr = String(examples).trim();
      }
      if (examplesStr) {
        combinedDescription += (description ? '\n\n' : '') + `Examples: ${examplesStr}`;
      }
    }

    let cleanPlaceholder = fieldDef.placeholder || fieldDef.columnHeader || fieldDef.fieldName || fieldName;
    if (cleanPlaceholder) {
      // Remove everything from "(e.g." or "(example" onwards
      const index1 = cleanPlaceholder.toLowerCase().indexOf('(e.g.');
      const index2 = cleanPlaceholder.toLowerCase().indexOf('(example');
      const index3 = cleanPlaceholder.toLowerCase().indexOf('e.g.');

      let splitIndex = -1;
      if (index1 !== -1) splitIndex = index1;
      else if (index2 !== -1) splitIndex = index2;
      else if (index3 !== -1) splitIndex = index3;

      if (splitIndex !== -1) {
        cleanPlaceholder = cleanPlaceholder.substring(0, splitIndex).trim();
      }
    }

    return {
      ...fieldDef,
      description,
      examples,
      combinedDescription,
      label: fieldDef.label || fieldDef.columnHeader || fieldDef.fieldName || fieldName,
      placeholder: cleanPlaceholder,
      required: fieldDef.required === true || fieldDef.required === 'true' || fieldDef.required === 'yes' || fieldDef.required === 1 || fieldDef['is-required'] === 'true' || fieldDef['is-required'] === true
    };
  }

  private getLegacyUiFieldDefinition(fieldName: string, validationsId?: string) {
    const legacySection = validationsId
      ? LEGACY_UI_FIELD_OVERRIDES[validationsId]
      : LEGACY_UI_FIELD_OVERRIDES["__root__"];

    if (!legacySection) {
      return null;
    }

    return legacySection[fieldName] || null;
  }

  /**
   * Retrieves a legacy UI validation definition from the small built-in fallback map.
   * @param fieldName The field name or column header to search for
   * @param validationsId Optional legacy section path (e.g., 'factors.factor')
   * @returns The validation definition if found, null otherwise
   */
  getLegacyUiValidationDefinition(fieldName: string, validationsId?: string) {
    return this.getLegacyUiFieldDefinition(fieldName, validationsId);
  }


  addAssay(studyId: string, payload: any): Observable<any> {
    const url = `${this.configService.config.metabolightsWSURL.baseURL}/studies/${studyId}/metadata-files/assays`;
    return this.http.post(url, payload, httpOptions).pipe(
      catchError(err => {
        console.error('Error creating assay:', err);
        return this.dataService.handleError(err);
      })
    );
  }

  updateAssayComments(studyId: string, assayName: string, payload: any): Observable<any> {
    const url = `${this.configService.config.metabolightsWSURL.baseURL}/studies/${studyId}/assays/comments`;
    const updatedPayload = {
      ...payload
    };
    const headers = httpOptions.headers.set("x-assay-file-name", assayName);
    return this.http.patch(url, updatedPayload, { headers }).pipe(
      catchError(err => {
        console.error('Error updating assay comments:', err);
        return this.dataService.handleError(err);
      })
    );
  }

  /**
   * Checks if the study status is provisional or restricted.
   * @param status The study status to check.
   * @returns True if the status is 'Provisional', empty, null, or undefined.
   */
  isRestrictedResource(status: string): boolean {
    return !status || status.trim() === "" || status.toLowerCase() === "provisional";
  }
}

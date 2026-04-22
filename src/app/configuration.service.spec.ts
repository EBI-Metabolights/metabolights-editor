import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ConfigurationService } from "./configuration.service";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe("ConfigurationService", () => {
  let service: ConfigurationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ConfigurationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("loads the base and runtime config and merges upload settings", async () => {
    const loadPromise = service.loadConfiguration();

    const configRequest = httpMock.expectOne((request) =>
      request.url.includes("assets/configs/config.json")
    );
    configRequest.flush({
      production: false,
      isTesting: true,
      sessionLength: 300000,
      origin: "test",
      endpoint: "test",
      loginURL: "login",
      clearJavaSession: true,
      javaLogoutURL: "http://localhost:8080/metabolights/logout",
      redirectURL: "console",
      metabolightsWSURL: {
        baseURL: "https://www.ebi.ac.uk/metabolights/ws",
        guides: "https://raw.githubusercontent.com/EBI-Metabolights/guides/test",
        ontologyDetails: "https://www.ebi.ac.uk/ols/api/ontologies",
      },
      doiWSURL: {
        article: "https://api.crossref.org/works",
      },
      europePMCURL: {
        article: "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core",
      },
      authenticationURL: {
        login: "/webservice/labs/authenticate",
        token: "/webservice/labs/authenticateToken",
        initialise: "/webservice/labs-workspace/initialise",
        studiesList: "/webservice/study/myStudies",
        getJwtWithOneTimeToken: "",
      },
      videoURL: {
        all: "",
        aspera: "",
        createAccount: "",
        createStudy: "",
        maf: "",
        factors: "",
        createAssay: "",
        protocols: "",
        samples: "",
        descriptors: "",
        editor: "",
      },
      ws3URL: "",
      auth: null,
    });

    const runtimeRequest = httpMock.expectOne((request) =>
      request.url.includes("assets/configs/editor-runtime.json")
    );
    runtimeRequest.flush({
      upload: {
        ftp: {
          user: "ftp-user",
          secret: "ftp-secret",
          server: "ftp.example.org",
        },
      },
    });

    await loadPromise;

    expect(service.config?.editorConfiguration?.upload?.ftp).toEqual({
      user: "ftp-user",
      secret: "ftp-secret",
      server: "ftp.example.org",
    });
  });

  it("continues loading when editor-runtime.json is missing", async () => {
    const loadPromise = service.loadConfiguration();

    const configRequest = httpMock.expectOne((request) =>
      request.url.includes("assets/configs/config.json")
    );
    configRequest.flush({
      production: false,
      isTesting: true,
      sessionLength: 300000,
      origin: "test",
      endpoint: "test",
      loginURL: "login",
      clearJavaSession: true,
      javaLogoutURL: "http://localhost:8080/metabolights/logout",
      redirectURL: "console",
      metabolightsWSURL: {
        baseURL: "https://www.ebi.ac.uk/metabolights/ws",
        guides: "https://raw.githubusercontent.com/EBI-Metabolights/guides/test",
        ontologyDetails: "https://www.ebi.ac.uk/ols/api/ontologies",
      },
      doiWSURL: {
        article: "https://api.crossref.org/works",
      },
      europePMCURL: {
        article: "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core",
      },
      authenticationURL: {
        login: "/webservice/labs/authenticate",
        token: "/webservice/labs/authenticateToken",
        initialise: "/webservice/labs-workspace/initialise",
        studiesList: "/webservice/study/myStudies",
        getJwtWithOneTimeToken: "",
      },
      videoURL: {
        all: "",
        aspera: "",
        createAccount: "",
        createStudy: "",
        maf: "",
        factors: "",
        createAssay: "",
        protocols: "",
        samples: "",
        descriptors: "",
        editor: "",
      },
      ws3URL: "",
      auth: null,
    });

    const runtimeRequest = httpMock.expectOne((request) =>
      request.url.includes("assets/configs/editor-runtime.json")
    );
    runtimeRequest.flush("missing", {
      status: 404,
      statusText: "Not Found",
    });

    await loadPromise;

    expect(service.config?.endpoint).toBe("test");
    expect(service.config?.editorConfiguration).toBeUndefined();
  });
});

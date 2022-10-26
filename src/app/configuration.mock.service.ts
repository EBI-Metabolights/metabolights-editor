import { Environment } from "src/environment.interface";

export class MockConfigurationService {
  private configData: Environment | undefined;

  async loadConfiguration() {
    this.configData = {
      production: false,
      isTesting: true,
      sessionLength: 300000,
      origin: "test",
      endpoint: "test",
      loginURL: "login",
      clearJavaSession: true,
      javaLogoutURL:
        "http://localhost:8080/metabolights/j_spring_security_logout",
      redirectURL: "console",
      metabolightsWSURL: {
        domain: "https://www.ebi.ac.uk/metabolights/",
        baseURL: "https://www.ebi.ac.uk/metabolights/ws",
        guides:
          "https://raw.githubusercontent.com/EBI-Metabolights/guides/test/",
        ontologyDetails: "https://www.ebi.ac.uk/ols/api/ontologies/",
      },
      doiWSURL: {
        article: "https://api.crossref.org/works/",
      },
      europePMCURL: {
        article:
          "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core",
      },
      authenticationURL: {
        login: "/webservice/labs/authenticate",
        token: "/webservice/labs/authenticateToken",
        initialise: "/webservice/labs-workspace/initialise",
        studiesList: "/webservice/study/myStudies",
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
    };
  }

  get config() {
    return this.configData;
  }
}

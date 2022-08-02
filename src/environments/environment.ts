// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isTesting: false,
  branch: 'production',
  //sessionLength: 21600000,
  sessionLength: 300000,
  origin: 'localhost:4200',
  endpoint: origin + "/metabolights",
  loginURL: 'login',
  redirectURL: 'console',
  MetabolightsWSURL: {
    domain: 'https://www.ebi.ac.uk/metabolights/',
    baseURL: 'https://www.ebi.ac.uk/metabolights/ws',
    guides: "https://raw.githubusercontent.com/EBI-Metabolights/guides/prod/",
    ontologyDetails: "https://www.ebi.ac.uk/ols/api/ontologies/"
  },
  DOIWSURL: {
      article: "https://api.crossref.org/works/"
  },
  EuropePMCURL: {
      article: "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core"
  },
  AuthenticationURL: {
    login: '/webservice/labs/authenticate',
    token: '/webservice/labs/authenticateToken',
    initialise: '/webservice/labs-workspace/initialise',
    studiesList: '/webservice/study/myStudies'
}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

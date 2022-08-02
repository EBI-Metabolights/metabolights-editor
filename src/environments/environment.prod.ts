export const environment = {
  production: true,
  isTesting: false,
  origin: 'https://www.ebi.ac.uk',
  endpoint: origin + "/metabolights",
  loginURL: 'login',
  redirectURL: 'console',
  MetabolightsWSURL: {
      domain: 'https://www.ebi.ac.uk/metabolights/',
      baseURL: 'https://www.ebi.ac.uk/metabolights/ws',
     
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

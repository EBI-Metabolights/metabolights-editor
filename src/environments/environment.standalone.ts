export const environment = {
    production: false,
    isTesting: false,
    //sessionLength: 21600000,
    sessionLength: 300000,
    origin: 'https://wwwdev.ebi.ac.uk', //change
    endpoint: origin + "/metabolights",
    loginURL: 'login',
    redirectURL: 'console',
    MetabolightsWSURL: {
        domain: 'https://wwwdev.ebi.ac.uk/metabolights/',//change
        baseURL: 'https://wwwdev.ebi.ac.uk/metabolights/ws',//change
       
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

}
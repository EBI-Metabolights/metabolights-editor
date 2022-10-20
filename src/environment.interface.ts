
export interface Environment {
    production: boolean; // Flag to indicate whether the editor is currently running in a production environment.
    isTesting: boolean; // Flag to indicate whether the editor is currently being run in a suite of tests.
    sessionLength: number; // Duration (in milliseconds) of a user session.
    origin: string; // Origin of webservice ie localhost:4200
    endpoint: string; // Root endpoint of metabolights.
    loginURL: string; // Url to route users who are not logged in the event they try and access auth guarded pages.logoutURL
    clearJavaSession: boolean; // Flag to decid whether to clear Java Spring session
    JavaLogoutURL: string; // Url to route browser to logout from Java spring session
    redirectURL: string; // Holds the url of the page that the user tried to access, in the event of successful authentication.
    MetabolightsWSURL: MWSURL; // Object containing urls for guides, ontologies and etc. This object is passed to the metabolights.service
    DOIWSURL: DOIWSURL; // Object containing url for DOI service.
    EuropePMCURL: EuropePMCURL; // Object containing url for europePMC service.
    AuthenticationURL: AuthenticationURL; // Object containing the different authentication and authorization endpoints.
    VideoURL: VideoURL // Object containing links to all help videos.
}

export interface VideoURL {
    all: string;
    aspera: string;
    create_account: string;
    create_study: string;
    maf: string;
    factors: string;
    create_assay: string;
    protocols: string;
    samples: string;
    descriptors: string;
    editor: string;
}

interface MWSURL {
    domain: string; // the domain where editor is running IE localhost:4200/metabolights
    baseURL: string; // the base url for the metabolights webservice ie localhost:4200/metabolighrs/ws
    guides: string; // the url for the guides, usually found in our raw github repo.
    ontologyDetails: string; // the url for ebi's OLS service, usually https://www.ebi.ac.uk/ols/api/ontologies/
}

interface DOIWSURL {
    article: string; // the address for the DOI API, usually https://api.crossref.org/works/
}

interface EuropePMCURL {
    article: string; // the address for the europePMC API, usually https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core
}

interface AuthenticationURL {
    login: string; // endpoint for login requests.
    token: string; // endpoint for requests to acquire and validate tokens.
    initialise: string; // endpoint to intialise the editor with the user information, and studies pertaining to that user.
    studiesList: string; // root study endpoint on the webservice, used to both get a list of studies and individual studies.
}


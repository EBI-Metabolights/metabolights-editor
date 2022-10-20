import { Environment } from 'src/environment.interface';

export class MockConfigurationService {
    private configData: Environment | undefined

    async loadConfiguration() {
        this.configData = {
            production: false,
            isTesting: true,
            sessionLength: 300000,
            origin: 'test',
            endpoint: 'test',
            loginURL: 'login',
            clearJavaSession : true,
            JavaLogoutURL: "http://localhost:8080/metabolights/j_spring_security_logout",
            redirectURL: 'console',
            MetabolightsWSURL: {
                domain: "https://www.ebi.ac.uk/metabolights/",
                baseURL: "https://www.ebi.ac.uk/metabolights/ws",
                guides: "https://raw.githubusercontent.com/EBI-Metabolights/guides/test/",
                ontologyDetails: "https://www.ebi.ac.uk/ols/api/ontologies/"
            },
            DOIWSURL: {
                article: "https://api.crossref.org/works/"
            },
            EuropePMCURL: {
                article: "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core"
            },
              AuthenticationURL: {
                login: "/webservice/labs/authenticate",
                token: "/webservice/labs/authenticateToken",
                initialise: "/webservice/labs-workspace/initialise",
                studiesList: "/webservice/study/myStudies"
            },
            VideoURL: {
                all: "",
                aspera: "",
                create_account: "",
                create_study: "",
                maf: "",
                factors: "",
                create_assay: "",
                protocols: "",
                samples: "",
                descriptors: "",
                editor: ""
            }

        }
    }

    get config() {
        return this.configData;
    }
}

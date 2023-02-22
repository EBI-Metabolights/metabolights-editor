import { isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
/* eslint-disable */
let origin = window.location.origin;
let branch = "development";

if (origin.indexOf("localhost") > -1) {
  origin = "https://wwwdev.ebi.ac.uk";
}

const host = window.location.host;
const subdomain = host.split(".")[0];

if (subdomain == "www") {
  branch = "master";
}

if (origin.indexOf("8080") > -1) {
  origin = origin.replace("8080", "5000");
}

const endpoint = origin + "/metabolights";

const metaboLightsWSDomain = endpoint;
const metaboLightsDomain = endpoint;

export const LoginURL = "login";
export const RedirectURL = "console";

export const MetaboLightsWSURL = {};
MetaboLightsWSURL["domain"] = metaboLightsDomain + "/";
MetaboLightsWSURL["baseURL"] = metaboLightsWSDomain + "/ws";
MetaboLightsWSURL["studiesList"] = MetaboLightsWSURL["baseURL"] + "/studies";
MetaboLightsWSURL["study"] = MetaboLightsWSURL["baseURL"] + "/studies";
MetaboLightsWSURL["validations"] = environment.contextPath + "/assets/configs/validations.json";
MetaboLightsWSURL["guides"] =
  "https://raw.githubusercontent.com/EBI-Metabolights/guides/" + branch + "/";

MetaboLightsWSURL["download"] = metaboLightsDomain + "/<study>/files";
MetaboLightsWSURL["ontologyDetails"] =
  "https://www.ebi.ac.uk/ols/api/ontologies/";

export const DOIWSURL = {};
DOIWSURL["article"] = "https://api.crossref.org/works/";

export const EuropePMCURL = {};
EuropePMCURL["article"] =
  "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core";

export const AuthenticationURL = {};
AuthenticationURL["login"] =
  metaboLightsDomain + "/webservice/labs/authenticate";
AuthenticationURL["token"] =
  metaboLightsDomain + "/webservice/labs/authenticateToken";
AuthenticationURL["initialise"] =
  metaboLightsDomain + "/webservice/labs-workspace/initialise";
AuthenticationURL["studiesList"] =
  metaboLightsDomain + "/webservice/study/myStudies";

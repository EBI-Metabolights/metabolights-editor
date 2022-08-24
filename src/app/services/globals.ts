import { isDevMode } from '@angular/core';

var origin = window.location.origin;
var branch = 'development';

if(origin.indexOf('localhost') > -1){
	origin = "https://wwwdev.ebi.ac.uk"
}

var host = window.location.host
var subdomain = host.split('.')[0]

if(subdomain == 'www'){
	branch = 'master';
}

if(origin.indexOf('8080') > -1){
	origin = origin.replace('8080', '5000')
}

var endpoint = origin + "/metabolights"

var metaboLightsWSDomain = endpoint;
var metaboLightsDomain = endpoint;

export const LoginURL 					= "login";
export const RedirectURL 				= "console";

export const MetaboLightsWSURL 			= {};
MetaboLightsWSURL['domain']				= metaboLightsDomain + "/"
MetaboLightsWSURL['baseURL']			= metaboLightsWSDomain + "/ws"
MetaboLightsWSURL['studiesList'] 		= MetaboLightsWSURL['baseURL'] + '/studies';
MetaboLightsWSURL['study'] 				= MetaboLightsWSURL['baseURL'] + '/studies';
MetaboLightsWSURL['validations'] 		= "assets/configs/validations.json";
MetaboLightsWSURL['guides']			= "https://raw.githubusercontent.com/EBI-Metabolights/guides/"+branch+"/"

MetaboLightsWSURL['download']			= metaboLightsDomain + "/<study>/files"
MetaboLightsWSURL['ontologyDetails']	= 'https://www.ebi.ac.uk/ols/api/ontologies/'

export const DOIWSURL 					= {};
DOIWSURL['article']						= "https://api.crossref.org/works/"

export const EuropePMCURL 				= {};
EuropePMCURL['article']					= "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core"

export const AuthenticationURL 			= {};
AuthenticationURL['login']				= metaboLightsDomain + "/ws/auth/login"
AuthenticationURL['token']				= metaboLightsDomain + "/ws/auth/validate-token"
AuthenticationURL['initialise']			= metaboLightsDomain + "/ws/auth/user";
AuthenticationURL['studiesList']		= metaboLightsDomain + "/webservice/study/myStudies";

import { isDevMode } from '@angular/core';

var origin = window.location.origin;

if(origin.indexOf('localhost') > -1){
	origin = "https://wwwdev.ebi.ac.uk"
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
MetaboLightsWSURL['download']			= metaboLightsDomain + "/<study>/files"
MetaboLightsWSURL['ontologyDetails']	= 'https://www.ebi.ac.uk/ols/api/ontologies/'
 

export const DOIWSURL 					= {};
DOIWSURL['article']						= "https://api.crossref.org/works/"

export const EuropePMCURL 				= {};
EuropePMCURL['article']					= "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<term>&format=json&resultType=core"

export const AuthenticationURL 			= {};
AuthenticationURL['login']				= metaboLightsDomain + "/webservice/labs/authenticate"
AuthenticationURL['token']				= metaboLightsDomain + "/webservice/labs/authenticateToken"
AuthenticationURL['initialise']			= metaboLightsDomain + "/webservice/labs-workspace/initialise";
AuthenticationURL['studiesList']		= metaboLightsDomain + "/webservice/study/myStudies";

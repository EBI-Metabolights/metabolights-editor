import { tassign } from 'tassign';
import { TOGGLE_LOADING,
		 ENABLE_LOADING,
		 DISABLE_LOADING,
		 ENABLE_ERROR,
		 DISABLE_ERROR,
		 SET_MESSAGE,
		 SET_LOADING_INFO,
		 SET_CONFIGURATION,
		 SET_TAB_INDEX,
		 INITIALISE,
		 SET_USER_STUDIES,
		 SET_GUIDES_MAPPINGS,
		 SET_SELECTED_LANGUAGE,
		 SET_GUIDES,
		 SET_USER } from './actions';

export const SHARED_INITIAL_STATE: Object =  {
	"loading" : true,
	"info": '',
	'configuration': '',
	'isCurator': false,
	'user': null,
	'error': false,
	'message': '',
	'currentTabIndex': '0',
	'isInitialised': false,
	'userStudies': null,
	'mappings': null,
	'selectedLanguage': 'en',
	'guides': null
};

function toggleLoading(state) {
  return tassign(state, { loading: !state.loading});
}

function enableError(state) {
  return tassign(state, { error: true});
}

function disableError(state) {
  return tassign(state, { error: false});
}

function setMessage(state, action) {
  return tassign(state, { message: action.body.message});
}

function enableLoading(state) {
	return tassign(state, { loading: true});
}

function disableLoading(state){
	return tassign(state, { loading: false});
}

function setLoadingInfo(state, action) {
  return tassign(state, { info: action.body.info });
}

function setCurrentTabIndex(state, action) {
  return tassign(state, { currentTabIndex: action.body.currentTabIndex });
}

function setInitilised(state, action){
	return tassign(state, {isInitialised: true})
}

function setUserStudies(state, action){
	return tassign(state, { userStudies: action.body.studies })
}

function setGuidesMappings(state, action){
	return tassign(state, { mappings: action.body.mappings })
}

function setSelectedLanguage(state, action){
	return tassign(state, { selectedLanguage: action.body.language })
}

function setGuides (state, action){
	return tassign(state, { guides: action.body.guides })
}

function setLoadingConfiguration(state, action) {
	let configurationValue = {}
	action.body.configuration.forEach( config => {
		if(config.name == 'Created With Configuration'){
			configurationValue['created_with'] = config.value
		}else if(config.name == 'Last Opened With Configuration'){
			configurationValue['opened_with'] = config.value
		}
	})
  return tassign(state, { configuration: configurationValue });
}

function setCurrentUser(state, action){
	let isCurator = action.body.user.role == 'ROLE_SUPER_USER' ? true: false
	return tassign(state, { user: action.body.user, isCurator: isCurator });
}

export function sharedReducer(state: Object = SHARED_INITIAL_STATE, action): Object {
  switch (action.type) {
    case TOGGLE_LOADING : return toggleLoading(state);
    case ENABLE_LOADING : return enableLoading(state);
    case DISABLE_LOADING : return disableLoading(state);
    case ENABLE_ERROR : return enableError(state);
    case DISABLE_ERROR : return disableError(state);
    case SET_MESSAGE : return setMessage(state, action);
    case SET_LOADING_INFO : return setLoadingInfo(state, action);
    case SET_CONFIGURATION : return setLoadingConfiguration(state, action);
    case SET_TAB_INDEX : return setCurrentTabIndex(state, action);
    case SET_USER : return setCurrentUser(state, action);
    case INITIALISE: return setInitilised(state, action);
	case SET_USER_STUDIES: return setUserStudies(state, action);
	case SET_GUIDES_MAPPINGS: return setGuidesMappings(state, action);
	case SET_SELECTED_LANGUAGE: return setSelectedLanguage(state, action);
	case SET_GUIDES: return setGuides(state, action);
  }

  return state;
}

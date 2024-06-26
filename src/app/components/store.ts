import { strictEqual } from "assert";
import { tassign } from "tassign";
import {
  TOGGLE_LOADING,
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
  SET_EDITOR_VERSION,
  SET_BACKEND_VERSION,
  SET_SELECTED_LANGUAGE,
  SET_GUIDES,
  SET_USER,
  RESET,
  SET_STUDY_PERMISSION,
  RESET_STUDY_PERMISSION,
  SET_BANNER_MESSAGE,
  SET_MAINTENANCE_MODE
} from "./actions";
import { SET_STUDY_ASSAY } from "./study/actions";

export interface IsInitialised {
  ready: boolean;
  time: string | Date;
}
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
export const SHARED_INITIAL_STATE: Record<string, any> = {
  loading: true,
  info: "",
  configuration: "",
  isCurator: false,
  curationRequest: null,
  user: null,
  error: false,
  message: "",
  currentTabIndex: "0",
  isInitialised: {
    ready: false,
    time: "",
  },
  userStudies: null,
  mappings: null,
  selectedLanguage: "en",
  guides: null,
  studyPermission: null,
  bannerMessage: null,

  maintenanceMode: false,
  editorVersion: {
    version: "",
    releaseName: ""
  },
  backendVersion: {
    about: {
      app: {
        version: "",
        name: ""
      },
      api: {
        version: "",
      }
    }
  }
};

function toggleLoading(state) {
  return tassign(state, { loading: !state.loading });
}

function enableError(state) {
  return tassign(state, { error: true });
}

function disableError(state) {
  return tassign(state, { error: false });
}

function setMessage(state, action) {
  return tassign(state, { message: action.body.message });
}

function enableLoading(state) {
  return tassign(state, { loading: true });
}

function disableLoading(state) {
  return tassign(state, { loading: false });
}

function setLoadingInfo(state, action) {
  return tassign(state, { info: action.body.info });
}

function setCurrentTabIndex(state, action) {
  return tassign(state, { currentTabIndex: action.body.currentTabIndex });
}

function setInitialised(state, action) {
  return tassign(state, {
    isInitialised: {
      ready: true,
      time: new Date(),
    },
  });
}

function reset(state, action) {
  return tassign(state, {
    isInitialised: {
      ready: false,
      time: "",
    },
  });
}

function setBannerHeader(state, action) {
  return tassign(state, { bannerMessage: action.body.bannerMessage });
}
function setMaintenanceMode(state, action) {
  return tassign(state, { maintenanceMode: action.body.maintenanceMode });
}

function setUserStudies(state, action) {
  return tassign(state, { userStudies: action.body.studies });
}

function setGuidesMappings(state, action) {
  return tassign(state, { mappings: action.body.mappings });
}

function setEditorVersion(state, action) {
  return tassign(state, { editorVersion: action.body.editorVersion });
}
function setBackendVersion(state, action) {
  return tassign(state, { backendVersion: action.body.backendVersion });
}

function setSelectedLanguage(state, action) {
  return tassign(state, { selectedLanguage: action.body.language });
}

function setGuides(state, action) {
  return tassign(state, { guides: action.body.guides });
}

function setStudyPermission(state, action) {
  return tassign(state, { studyPermission: action.body.studyPermission });
}
function resetStudyPermission(state, action) {
  return tassign(state, { studyPermission: null });
}

function setLoadingConfiguration(state, action) {
  const configurationValue = {};
  action.body.configuration.forEach((config) => {
    if (config.name === "Created With Configuration") {
      configurationValue["created_with"] = config.value;
    } else if (config.name === "Last Opened With Configuration") {
      configurationValue["opened_with"] = config.value;
    }
  });
  return tassign(state, { configuration: configurationValue });
}

function setCurrentUser(state, action) {
  const isCurator = action.body.user.role === "ROLE_SUPER_USER" ? true : false;
  return tassign(state, { user: action.body.user, isCurator });
}

export function sharedReducer(
  state: Record<string, any> = SHARED_INITIAL_STATE,
  action
): Record<string, any> {
  switch (action.type) {
    case TOGGLE_LOADING:
      return toggleLoading(state);
    case ENABLE_LOADING:
      return enableLoading(state);
    case DISABLE_LOADING:
      return disableLoading(state);
    case ENABLE_ERROR:
      return enableError(state);
    case DISABLE_ERROR:
      return disableError(state);
    case SET_MESSAGE:
      return setMessage(state, action);
    case SET_LOADING_INFO:
      return setLoadingInfo(state, action);
    case SET_CONFIGURATION:
      return setLoadingConfiguration(state, action);
    case SET_TAB_INDEX:
      return setCurrentTabIndex(state, action);
    case SET_USER:
      return setCurrentUser(state, action);
    case INITIALISE:
      return setInitialised(state, action);
    case RESET:
      return reset(state, action);
    case SET_USER_STUDIES:
      return setUserStudies(state, action);
    case SET_GUIDES_MAPPINGS:
      return setGuidesMappings(state, action);
    case SET_EDITOR_VERSION:
      return setEditorVersion(state, action);
    case SET_BACKEND_VERSION:
      return setBackendVersion(state, action);
    case SET_SELECTED_LANGUAGE:
      return setSelectedLanguage(state, action);
    case SET_GUIDES:
      return setGuides(state, action);
    case SET_STUDY_PERMISSION:
      return setStudyPermission(state, action);
    case RESET_STUDY_PERMISSION:
      return resetStudyPermission(state, action);
    case SET_BANNER_MESSAGE:
      return setBannerHeader(state, action);
    case SET_MAINTENANCE_MODE:
      return setMaintenanceMode(state, action);
  }

  return state;
}

import { createReducer, on } from "@ngrx/store";
import { IsInitialised } from "../components/store";
 import * as MetaEditorSettingsActions from "./meta-settings.actions";

export interface MetaEditorSettings {
    loading: boolean;
    info: string;
    error: boolean;
    isInitialised: IsInitialised;
    selectedLanguage: string;
}

export const initialState: Readonly<MetaEditorSettings> = {
    loading: true,
    info: "",
    error: false,
    isInitialised: {
        ready: false,
        time: "",
    },
    selectedLanguage: "en"
}

export const metaSettingsReducer = createReducer(
    initialState,
    /**
     * previous selectors referenced in:
     * /components/shared/loading/loading.component [x] removed? []
     * 
     * previous dispatches referenced in:
     * /app/services/editor.service [x] removed? []
     */
    on(MetaEditorSettingsActions.setLoadingEnabled, state =>({...state, loading: true})),
    /**
     * previous dispatches referenced in:
     * /component/auth/login/login.component [x] removed? []
     * /components/guide/create/create.component [x] removed? []
     * /components/public/guides/guides.component [x] removed? []
     * /components/shared/errors/page-bot-found/page-not-found.component [x] removed []
     * /services/editor.service [x] removed? []
     */
    on(MetaEditorSettingsActions.setLoadingDisabled, state => ({...state, loading: false})),
    /**
     * previous dispatches referenced in:
     * /services/editor.service [x] removed? []
     */
    on(MetaEditorSettingsActions.toggleLoading, state => ({...state, loading: !state.loading})),
    /**
     * previous selector referenced in:
     * /components/shared/loading/loading.component [x] removed? []
     * 
     * previous dispatches referenced in:
     * /components/console/console.component [x] removed? []
     * /services/editor.service (4) [x] removed? []
     */
    on(MetaEditorSettingsActions.setLoadingInfo, (state, {newInfo}) => ({...state, info: newInfo})),
    /**
     * previous selector referenced in:
     * /authguard.service (2) [x] removed ? []
     * /components/public/study/study.component [x] removed? []
     * /services/editor.service (2) [x] removed? []
     */
    on(MetaEditorSettingsActions.setInitialised, state => ({...state, isInitialised: {
        ready: true,
        time: new Date()
    }})),
    /**
     * previous dispatches referenced in:
     * /services/editor.service [x] removed? []
     */
    on(MetaEditorSettingsActions.resetInit, state => ({...state, isInitialised: {
        ready: false,
        time: ""
    }})),
    /**
     * previous selector referenced in:
     * /components/public/guide.component [] removed? []
     * 
     * previous dispatches referenced in:
     * /services/editor.service [] removed? []
     */
    on(MetaEditorSettingsActions.setSelectedLanguage, (state, {newLang}) => ({...state, selectedLanguage: newLang})),
    on(MetaEditorSettingsActions.setErrorEnabled, state => ({...state, error: true})),
    on(MetaEditorSettingsActions.setErrorDisabled, state => ({...state, error: false}))


)

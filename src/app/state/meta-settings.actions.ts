import { createAction, props } from "@ngrx/store";


export const setLoadingEnabled = createAction('[Loading] enabled')

export const setLoadingDisabled = createAction('[Loading] disabled')

export const toggleLoading = createAction('[Loading] toggled')

export const setLoadingInfo = createAction('[Loading] info updated', props<{newInfo: string}>())

export const setInitialised = createAction('[IsInit] set init')

export const resetInit = createAction('[IsInit] reset')

export const setSelectedLanguage = createAction('[Language] set', props<{newLang: string}>())

export const setErrorEnabled = createAction('[Error] enabled')

export const setErrorDisabled = createAction('[Error] disabled')
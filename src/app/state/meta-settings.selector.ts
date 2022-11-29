import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MetaEditorSettings } from "./meta-settings.reducer";

export const selectMeta = createFeatureSelector<Readonly<MetaEditorSettings>>('meta')


export const selectLoading = createSelector(
    selectMeta,
    (meta) => {
        return meta.loading
    }
)


export const selectLoadingInfo = createSelector(
    selectMeta,
    (meta) => {
        return meta.info
    }
)

export const selectIsInitialised = createSelector(
    selectMeta,
    (meta) => {
        return meta.isInitialised
    }
)

export const selectLanguage = createSelector(
    selectMeta,
    (meta) => {
        return meta.selectedLanguage
    }
)
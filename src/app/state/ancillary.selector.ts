import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Ancillary } from "./ancillary.reducer";

export const selectAncillary = createFeatureSelector<Readonly<Ancillary>>('ancillary')

export const selectGuidesMappings = createSelector(
    selectAncillary,
    (ancillary) => {
        return ancillary.guidesMappings
    }
)

export const selectGuides = createSelector(
    selectAncillary,
    (ancillary) => {
        return ancillary.guides
    }
)

export const selectTabIndex = createSelector(
    selectAncillary,
    (ancillary) => {
        return ancillary.tabIndex
    }
)

export const selectLanguage = createSelector(
    selectAncillary,
    (ancillary) => {
        return ancillary.selectedLanguage
    }
)
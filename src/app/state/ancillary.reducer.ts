import { createReducer, on } from "@ngrx/store";
import { GuidesMapping } from "../models/mtbl/mtbls/interfaces/guides-mapping.interface";
import * as AncillaryActions from "./ancillary.actions"

export interface Ancillary {
    guidesMappings: GuidesMapping[]; // should maybe move to meta settings, consider when done.
    guides: Object;
    tabIndex: string;
    configuration: any;
}

export const initialAncillaryState: Readonly<Ancillary> = {
    guidesMappings: [],
    guides: null,
    tabIndex: "1",
    configuration: null,
}

export const ancillaryReducer = createReducer(
    initialAncillaryState,
    /**
     * references to previous selector in:
     * /components/public/guides.component [x] removed? []
     * 
     * references to previous dispatches in:
     * /components/public/guides/ [x] removed? []
     */
    on(AncillaryActions.retrievedGuidesMappings, (state, {newMappings}) => ({...state, guidesMappings: newMappings})),
    /**
     * references to previous selector in:
     * /component/public/guides.component [x] removed ? []
     * 
     * references to previous dispatches in:
     * /services/editor.service.ts (2) [x] removed? []
     */
    on(AncillaryActions.retrievedGuides, (state, {newGuides}) => ({...state, guides: newGuides})),
    /**
     * references to previous selector in:
     * /components/public/study.component (incl template) [] removed? []
     * 
     * references to previous dispatches referenced in:
     * /components/public/study/study.component [x] removed? []
     */
    on(AncillaryActions.setTabIndex, (state, {newIndex}) => ({...state, index: newIndex})),
    /**
     * references to the previous selector in:
     * nowehere seemingly
     * 
     * references to previous dispatches in:
     * /services/editor.service [x] removed?[]
     */
    on(AncillaryActions.retrievedConfiguration, (state, {newConfiguration}) => ({...state, configuration: newConfiguration}))
)
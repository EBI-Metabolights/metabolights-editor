import { createReducer, on } from "@ngrx/store";
import { GuidesMapping } from "../models/mtbl/mtbls/interfaces/guides-mapping.interface";
import * as AncillaryActions from "./ancillary.actions"

export interface Ancillary {
    guidesMappings: GuidesMapping[]; // should maybe move to meta settings, consider when done.
    guides: Object;
    tabIndex: string;
    configuration: any;
    selectedLanguage: string;

}

export const initialAncillaryState: Readonly<Ancillary> = {
    guidesMappings: [],
    guides: null,
    tabIndex: "1",
    configuration: null,
    selectedLanguage: "en"

}

export const ancillaryReducer = createReducer(
    initialAncillaryState,
    /**
     * references to previous selector in:
     * /components/public/guides.component [x] removed? [x]
     * 
     * references to previous dispatches in:
     * /components/public/guides/ [x] removed? [x]
     */
    on(AncillaryActions.retrievedGuidesMappings, (state, {newMappings}) => ({...state, guidesMappings: newMappings})),
    /**
     * references to previous selector in:
     * /component/public/guides.component [x] removed ? [x]
     * 
     * references to previous dispatches in:
     * /services/editor.service.ts (2) [x] removed? [x]
     */
    on(AncillaryActions.retrievedGuides, (state, {newGuides}) => ({...state, guides: newGuides})),
    /**
     * references to previous selector in:
     * /components/public/study.component (incl template) [x] removed? [x]
     * 
     * references to previous dispatches referenced in:
     * /components/public/study/study.component [x] removed? [x]
     */
    on(AncillaryActions.setTabIndex, (state, {newIndex}) => ({...state, index: newIndex})),
    /**
     * references to the previous selector in:
     * nowehere seemingly
     * 
     * references to previous dispatches in:
     * /services/editor.service [x] removed?[x]
     */
    on(AncillaryActions.retrievedConfiguration, (state, {newConfiguration}) => ({...state, configuration: newConfiguration})),
        /**
     * previous selector referenced in:
     * /components/public/guide.component [x] removed? [x]
     * 
     * previous dispatches referenced in:
     * /services/editor.service [x] removed? [x]
     */
    on(AncillaryActions.setSelectedLanguage, (state, {newLang}) => ({...state, selectedLanguage: newLang})),
   
)
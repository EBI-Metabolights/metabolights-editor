import { createAction, props } from "@ngrx/store";
import { StudyConfiguration } from "../models/mtbl/mtbls/interfaces/configuration.interface";
import { GuidesMapping } from "../models/mtbl/mtbls/interfaces/guides-mapping.interface";

export const retrievedGuidesMappings = createAction(
    '[Ancillary/API] retrieved guides mappings',
    props<{newMappings: GuidesMapping[]}>()
)

export const retrievedGuides = createAction(
    '[Ancillary/API] retrieved guides',
    props<{newGuides: any}>()
)

export const setTabIndex = createAction(
    '[Ancillary] set tab index',
    props<{newIndex: string}>()
)

export const retrievedConfiguration = createAction(
    '[Ancillary/API] retrieved configuration',
    props<{newConfiguration: StudyConfiguration[]}>()
)

export const setSelectedLanguage = createAction('[Language] set', props<{newLang: string}>())

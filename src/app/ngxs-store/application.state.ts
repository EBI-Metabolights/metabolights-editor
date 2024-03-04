import { Action, Selector, State, StateContext } from "@ngxs/store"
import { StudyPermission } from "../services/headers"
import { SetReadonly, SetStudyError } from "./application.actions"
import { Injectable } from "@angular/core"

export interface MtblsEditorVersion {
    version: string,
    releaseName: string
}

export interface MtblsBackendVersion {
    about: MtblsBackendAbout
}

export interface MtblsBackendAbout {
    app: {
        version: string,
        name: string
    }
    api: {
        version: string
    }
}

export interface ApplicationStateModel {
    editorVersion: MtblsEditorVersion,
    backendVersion: MtblsBackendVersion,
    selectedLanguage: string,
    mappings: Record<string, any>,
    guides: any,
    studyPermission: StudyPermission,
    bannerMessage: string,
    maintenanceMode: boolean,
    controlLists: Record<string, any[]>,
    investigationFailed: boolean,
    readonly: boolean

}
@Injectable()
@State<ApplicationStateModel>({
    name: 'application',
    defaults: {
        editorVersion: {
            version: "",
            releaseName:""
        },
        backendVersion: {
            about: {
                app: {
                    version: "",
                    name: ""
                },
                api: {
                    version: ""
                }
            }
        },
        selectedLanguage: "en",
        mappings: null,
        guides: null,
        studyPermission: null,
        bannerMessage: null,
        maintenanceMode: false,
        controlLists: null, 
        investigationFailed: null,
        readonly: null
    }
})
export class ApplicationState {

    @Action(SetStudyError)
    SetError(ctx: StateContext<ApplicationStateModel>, action: SetStudyError) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            investigationFailed: action.error
        })
    }

    @Selector()
    static investigationFailed(state: ApplicationStateModel): boolean {
        return state.investigationFailed
    }

    @Action(SetReadonly)
    SetReadOnly(ctx: StateContext<ApplicationStateModel>, action: SetReadonly) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            readonly: action.readonly
        });
    }

    @Selector()
    static readonly(state: ApplicationStateModel): boolean {
        return state.readonly
    }

}
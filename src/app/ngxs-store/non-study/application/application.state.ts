import { Action, Selector, State, StateContext } from "@ngxs/store";
import { StudyPermission } from "../../../services/headers";
import { BackendVersion, BannerMessage, DefaultControlLists, EditorVersion, MaintenanceMode, SetProtocolExpand,
  SetReadonly, SetSelectedLanguage, SetStudyError,
  SetTransferStatus,
  StudyPermissionNS} from "./application.actions";
import { Injectable } from "@angular/core";
import { ApplicationService } from "src/app/services/decomposed/application.service";
import { TransferStatus } from "src/app/services/transfer-healthcheck.service";

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
    // mappings: Record<string, any>,
    guides: any,
    studyPermission: StudyPermission,
    bannerMessage: string,
    maintenanceMode: boolean,
    controlLists: Record<string, any[]>,
    applicationTemplates: Record<string, any[]>,
    investigationFailed: boolean,
    readonly: boolean
    isProtocolsExpanded: boolean,
    toastrSettings: Record<string, any>,
    transferStatus: TransferStatus

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
        // mappings: null,
        guides: null,
        studyPermission: null,
        bannerMessage: null,
        maintenanceMode: false,
        controlLists: {},              // legacy map
        applicationTemplates: {},
        investigationFailed: null,
        readonly: null,
        isProtocolsExpanded: true,
        toastrSettings: {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
          },
        transferStatus: {
            privateFtp: {
                online: null
            },
            publicFtp: {
                online: null
            },
            aspera: {
                online: null
            }
        }
    }
})
export class ApplicationState {

    constructor(private applicationService: ApplicationService) {}

    @Action(SetStudyError)
    SetError(ctx: StateContext<ApplicationStateModel>, action: SetStudyError) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            investigationFailed: action.error
        });
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

    @Action(EditorVersion.Get)
    GetEditorVersion(ctx: StateContext<ApplicationStateModel>, action: EditorVersion.Get) {
        this.applicationService.getVersionInfo().subscribe(
            (versionInfo) => {
                console.log("Loaded version: " + versionInfo.version + "-" + versionInfo.releaseName);
                ctx.dispatch(new EditorVersion.Set(versionInfo));
            },
            (error) => {
                console.error(`Could not get Editor version info: ${JSON.stringify(error)}`)
                const missingno = {
                    version: "",
                    releaseName: ""
                }
                ctx.dispatch(new EditorVersion.Set(missingno));
            }
        )
    }


    @Action(EditorVersion.Set)
    SetEditorVersion(ctx: StateContext<ApplicationStateModel>, action: EditorVersion.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            editorVersion: action.version
        });
    }

    @Selector()
    static editorVersion(state: ApplicationStateModel): MtblsEditorVersion {
        return state.editorVersion
    }

    @Action(BackendVersion.Get)
    GetBackendVersion(ctx: StateContext<ApplicationStateModel>, action: BackendVersion.Get) {
        this.applicationService.getApiVersionInfo().subscribe(
            (apiVersionInfo) => {
                console.log("Loaded API version: " + apiVersionInfo.about.api.version);
                ctx.dispatch(new BackendVersion.Set(apiVersionInfo));
            },
            (error) => {
                const missingno = {
                    about:{
                        app:{
                            version: "",
                            name: ""
                          },
                          api:{
                            name: "",
                            version: "",
                          }
                    }

                  };
                ctx.dispatch(new BackendVersion.Set(missingno))
            }
        )
    }

    @Action(BackendVersion.Set)
    SetBackendVersion(ctx: StateContext<ApplicationStateModel>, action: BackendVersion.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            backendVersion: action.version
        });
    }

    @Selector()
    static backendVersion(state: ApplicationStateModel) {
        return state.backendVersion
    }

    @Action(SetSelectedLanguage)
    SetLanguage(ctx: StateContext<ApplicationStateModel>, action: SetSelectedLanguage) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            selectedLanguage: action.language
        });
    }

    @Selector()
    static selectedLanguage(state: ApplicationStateModel) {
        return state.selectedLanguage
    }

    @Selector()
    static guides(state: ApplicationStateModel) {
        return state.guides
    }

    @Action(BannerMessage.Get)
    GetBannerMessage(ctx: StateContext<ApplicationStateModel>, action: BannerMessage.Get) {
        this.applicationService.getBannerHeader().subscribe(
            (messageResponse) => {
                ctx.dispatch(new BannerMessage.Set(messageResponse.content));
            },
            (error) => {
                console.error(`Unable to get banner header message: ${error}`)
                ctx.dispatch(new BannerMessage.Set(null));
            }
        )
    }

    @Action(BannerMessage.Set)
    SetBannerMessage(ctx: StateContext<ApplicationStateModel>, action: BannerMessage.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            bannerMessage: action.message
        });
    }

    @Selector()
    static bannerMessage(state: ApplicationStateModel) {
        return state.bannerMessage
    }

    @Action(MaintenanceMode.Get)
    GetMaintenanceMode(ctx: StateContext<ApplicationStateModel>, action: MaintenanceMode.Get) {
        this.applicationService.checkMaintenanceMode().subscribe(
            (response) => {
                ctx.dispatch(new MaintenanceMode.Set(response.content));
            },
            (error) => {
                console.error(`Unable to infer whether maintenance mode is enabled: ${error}`)
                ctx.dispatch(new MaintenanceMode.Set(false));
            }
        )
    }

    @Action(MaintenanceMode.Set)
    SetMaintenanceMode(ctx: StateContext<ApplicationStateModel>, action: MaintenanceMode.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            maintenanceMode: action.maintenanceEnabled
        });
    }

    @Selector()
    static maintenanceMode(state: ApplicationStateModel) {
        return state.maintenanceMode
    }

    // @Action(DefaultControlLists.Get)
    // GetDefaultControlLists(ctx: StateContext<ApplicationStateModel>) {
    //     return ctx.getState().controlLists; //just for development purposes
    // }

    @Action(DefaultControlLists.Get) //enable thsis when production
    GetDefaultControlLists(ctx: StateContext<ApplicationStateModel>, action: DefaultControlLists.Get) {
        this.applicationService.getDefaultControlLists().subscribe({
            next: (response) => {
                ctx.dispatch(new DefaultControlLists.Set(response.content));
            },
            error: (error) => {
                console.error(`Unable to get default control lists: ${error}`)
                ctx.dispatch(new DefaultControlLists.Set({}));
            }
          }
        )
    }

@Action(DefaultControlLists.Set)
  setDefaultControlLists(ctx: StateContext<ApplicationStateModel>, action: DefaultControlLists.Set) {
    const payload = action.lists || {};
    const state = ctx.getState();

    const incomingFlat: Record<string, any[]> = {controls:  payload.controls}

  //  const merged = {
  //     ...(state.controlLists || {}),
  //     ...(payload.controls || {})
  //   };

    ctx.setState({
        ...state,
        applicationTemplates: payload.templates,
        controlLists: incomingFlat
    });

  }

    // @Action(DefaultControlLists.Set)
    // SetDefaultControlLists(ctx: StateContext<ApplicationStateModel>, action: DefaultControlLists.Set) {
    //     const state = ctx.getState();
    //     ctx.setState({
    //         ...state,
    //         controlLists: action.lists
    //     });
    // }

    @Selector()
    static controlLists(state: ApplicationStateModel) {
        return state.controlLists
    }

    @Selector()
    static assayFileHeaderTemplates(state: ApplicationStateModel) {
        return state.applicationTemplates.assayFileHeaderTemplates
    }
    @Selector()
    static sampleFileHeaderTemplates(state: ApplicationStateModel) {
        return state.applicationTemplates.sampleFileHeaderTemplates
    }
   @Selector()
    static assignmentFileHeaderTemplates(state: ApplicationStateModel) {
        return state.applicationTemplates.assignmentFileHeaderTemplates
    }
   @Selector()    static investigationFileHeaderTemplates(state: ApplicationStateModel) {
        return state.applicationTemplates.investigationFileTemplates
    }
   @Selector()
    static protocolTemplates(state: ApplicationStateModel) {
        return state.applicationTemplates.protocolTemplates
    }
   @Selector()
    static templateConfiguration(state: ApplicationStateModel) {
        return state.applicationTemplates.configuration
    }
    @Action(SetProtocolExpand)
    SetProtocolsExpanded(ctx: StateContext<ApplicationStateModel>, action: SetProtocolExpand) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            isProtocolsExpanded: action.expand
        });
    }

    @Selector()
    static isProtocolsExpanded(state: ApplicationStateModel) {
        return state.isProtocolsExpanded
    }

    @Selector()
    static toastrSettings(state: ApplicationStateModel) {
        return state.toastrSettings
    }

    @Action(StudyPermissionNS.Set)
    SetStudyPermissions(ctx: StateContext<ApplicationStateModel>, action: StudyPermissionNS.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            studyPermission: action.permission
        })
    }

    @Selector()
    static studyPermission(state: ApplicationStateModel) {
        return state.studyPermission;
    }

    @Action(SetTransferStatus)
    SetTransferStatus({getState, setState}: StateContext<ApplicationStateModel>, {status}: SetTransferStatus) {
        const state = getState()
        setState({
            ...state,
            transferStatus: status
        })
    }

    @Selector()
    static transferStatus(state: ApplicationStateModel) {
        return state.transferStatus
    }

}

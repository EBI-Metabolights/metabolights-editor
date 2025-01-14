import { Action, Selector, State, StateContext } from "@ngxs/store";
import { StudyPermission } from "../../../services/headers";
import { BackendVersion, BannerMessage, DefaultControlLists, EditorVersion, Guides,
  GuidesMappings, MaintenanceMode, SetProtocolExpand,
  SetReadonly, SetSelectedLanguage, SetStudyError,
  StudyPermissionNS} from "./application.actions";
import { Injectable } from "@angular/core";
import { ApplicationService } from "src/app/services/decomposed/application.service";

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
    isProtocolsExpanded: boolean,
    toastrSettings: Record<string, any>

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
        readonly: null,
        isProtocolsExpanded: true,
        toastrSettings: {
            timeOut: "2500",
            positionClass: "toast-top-center",
            preventDuplicates: true,
            extendedTimeOut: 0,
            tapToDismiss: false,
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

    @Action(GuidesMappings.Get)
    GetGuidesMapping(ctx: StateContext<ApplicationStateModel>, action: GuidesMappings.Get) {
        this.applicationService.getLanguageMappings().subscribe(
            (mappings) => {
                ctx.dispatch(new GuidesMappings.Set(mappings));
                const selected_language = localStorage.getItem("selected_language");
                mappings["languages"].forEach((language) => {
                  if (
                    (selected_language && language.code === selected_language) ||
                    (!selected_language && language.default)
                  ) {
                    ctx.dispatch(new SetSelectedLanguage(language.code));
                    ctx.dispatch(new Guides.Get(language))


                  }
                });
            },
            (error) => {
                console.error(`Error in retrieving language mappings: ${error}`)
            }
        )
    }

    @Action(GuidesMappings.Set)
    SetMapping(ctx: StateContext<ApplicationStateModel>, action: GuidesMappings.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            mappings: action.mappings
        });
    }

    @Selector()
    static mappings (state: ApplicationStateModel): Record<string, any> {
        return state.mappings
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

    @Action(Guides.Get)
    GetGuides(ctx: StateContext<ApplicationStateModel>, action: Guides.Get) {
        /**
         * The below if block accounts for the loadLanguage method in the editor service, which replicates
         * a lot of code from loadGuides. I have included a flag on the Guides.get action so we can reuse the action.
         */
        if (action.setLanguage == true) {
            localStorage.setItem("selected_language", action.language.code);
            ctx.dispatch(new SetSelectedLanguage(action.language.code));
        }

        this.applicationService.getGuides(action.language.code).subscribe(
            (guides) => {
                ctx.dispatch(new Guides.Set(guides["data"]))
            },
            (error) => {
                console.error(`Error in retrieving guides: ${error}`)
            }
        );

    }

    @Action(Guides.Set)
    SetGuides(ctx: StateContext<ApplicationStateModel>, action: Guides.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            guides: action.guides
        });
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

    @Action(DefaultControlLists.Get)
    GetDefaultControlLists(ctx: StateContext<ApplicationStateModel>, action: DefaultControlLists.Get) {
        this.applicationService.getDefaultControlLists().subscribe(
            (response) => {
                ctx.dispatch(new DefaultControlLists.Set(response.controlLists));
            },
            (error) => {
                console.error(`Unable to get default control lists: ${error}`)
                ctx.dispatch(new DefaultControlLists.Set({}));
            }
        )
    }

    @Action(DefaultControlLists.Set)
    SetDefaultControlLists(ctx: StateContext<ApplicationStateModel>, action: DefaultControlLists.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            controlLists: action.lists
        });
    }

    @Selector()
    static controlLists(state: ApplicationStateModel) {
        return state.controlLists
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

}

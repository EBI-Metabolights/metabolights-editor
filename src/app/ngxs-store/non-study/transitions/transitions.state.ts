import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IntermittentRefreshActionStack, Loading, SetChecklistSeen, SetChecklistStudyId, SetLoadingInfo, SetTabIndex } from "./transitions.actions";


export interface TransitionStateModel {
    loading: boolean,
    loadingInformation: string,
    currentTabIndex: string,
    intermittentRefreshActionStack: string[],
    checklist_seen: boolean,
    checklist_study_id: string | null
}

@State<TransitionStateModel>({
    name: 'transitions',
    defaults: {
        loading: true,
        loadingInformation: "",
        currentTabIndex: "0",
        intermittentRefreshActionStack: [],
        checklist_seen: false,
        checklist_study_id: null
    }
})
@Injectable()
export class TransitionsState {

    private loadingInfoTimeout: any;
    private pendingDisableTimeout: any;

    @Action(SetLoadingInfo)
    setLoadingInfo(ctx: StateContext<TransitionStateModel>, action: SetLoadingInfo) {
        // Clear any pending disable
        if (this.pendingDisableTimeout) {
            clearTimeout(this.pendingDisableTimeout);
            this.pendingDisableTimeout = null;
        }

        const state = ctx.getState();
        ctx.setState({
            ...state,
            loadingInformation: action.info,
            loading: true
        });

        // Clear any existing timer
        if (this.loadingInfoTimeout) {
            clearTimeout(this.loadingInfoTimeout);
        }

        // Set new timer to auto-disable loading after 4s if nothing else happens
        this.loadingInfoTimeout = setTimeout(() => {
            const currentState = ctx.getState();
            if (currentState.loading) {
                console.warn('Forced to disable loading state after 4s. Possible error.')
                ctx.dispatch(new Loading.Disable());
            }
        }, 4000);
    }

    @Action(SetTabIndex)
    setTabIndex(ctx: StateContext<TransitionStateModel>, action: SetTabIndex) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            currentTabIndex: action.index
        })
    }

    @Action(SetChecklistSeen)
    setChecklistSeen(ctx: StateContext<TransitionStateModel>, action: SetChecklistSeen) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            checklist_seen: action.seen
        });
    }

    @Action(SetChecklistStudyId)
    setChecklistStudyId(ctx: StateContext<TransitionStateModel>, action: SetChecklistStudyId) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            checklist_study_id: action.studyId
        });
    }

    @Action(Loading.Toggle)
    toggleLoading(ctx: StateContext<TransitionStateModel>) {
        const state = ctx.getState();
        const nextValue = !state.loading;
        if (nextValue) {
            ctx.dispatch(new Loading.Enable());
        } else {
            ctx.dispatch(new Loading.Disable());
        }
    }

    @Action(Loading.Enable)
    enableLoading(ctx: StateContext<TransitionStateModel>) {
        // Clear any pending disable
        if (this.pendingDisableTimeout) {
            clearTimeout(this.pendingDisableTimeout);
            this.pendingDisableTimeout = null;
        }

        const state = ctx.getState();
        ctx.setState({
            ...state,
            loading: true
        })
    }

    @Action(Loading.Disable)
    disableLoading(ctx: StateContext<TransitionStateModel>) {
        // Clear the auto-disable timeout if manually requested to disable
        if (this.loadingInfoTimeout) {
            clearTimeout(this.loadingInfoTimeout);
            this.loadingInfoTimeout = null;
        }

        // Debounce the disable to prevent flickering between API calls
        if (this.pendingDisableTimeout) {
            clearTimeout(this.pendingDisableTimeout);
        }

        this.pendingDisableTimeout = setTimeout(() => {
            const state = ctx.getState();
            ctx.setState({
                ...state,
                loading: false
            });
            this.pendingDisableTimeout = null;
        }, 300);
    }

    @Action(IntermittentRefreshActionStack.Sync)
    sync(
        {patchState}: StateContext<TransitionStateModel>, 
        {actionStack}: IntermittentRefreshActionStack.Sync
    ) {
        patchState({
            intermittentRefreshActionStack: actionStack
        });
    }

    @Selector()
    static actionStack(state: TransitionStateModel) {
       return (stateContainer: string) => {
        return state?.intermittentRefreshActionStack?.filter(action => action.includes(stateContainer)) || [];
       }
    }

    @Selector()
    static loading(state: TransitionStateModel): boolean {
        return state?.loading
    }

    @Selector()
    static loadingInformation(state: TransitionStateModel): string {
        return state?.loadingInformation
    }

    @Selector()
    static currentTabIndex(state: TransitionStateModel): string {
        return state?.currentTabIndex
    }

    @Selector()
    static checklistSeen(state: TransitionStateModel): boolean {
        return !!state?.checklist_seen
    }

    @Selector()
    static checklistStudyId(state: TransitionStateModel): string | null {
        return state?.checklist_study_id || null
    }
}

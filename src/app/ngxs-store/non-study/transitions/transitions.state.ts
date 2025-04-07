import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IntermittentRefreshActionStack, Loading, SetLoadingInfo, SetTabIndex } from "./transitions.actions";


export interface TransitionStateModel {
    loading: boolean,
    loadingInformation: string,
    currentTabIndex: string,
    intermittentRefreshActionStack: string[]
}

@State<TransitionStateModel>({
    name: 'transitions',
    defaults: {
        loading: true,
        loadingInformation: "",
        currentTabIndex: "0",
        intermittentRefreshActionStack: []
    }
})
@Injectable()
export class TransitionsState {

    @Action(SetLoadingInfo)
    setLoadingInfo(ctx: StateContext<TransitionStateModel>, action: SetLoadingInfo) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            loadingInformation: action.info
        })
    }

    @Action(SetTabIndex)
    setTabIndex(ctx: StateContext<TransitionStateModel>, action: SetTabIndex) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            currentTabIndex: action.index
        })
    }

    @Action(Loading.Toggle)
    toggleLoading(ctx: StateContext<TransitionStateModel>) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            loading: !state.loading
        })
    }

    @Action(Loading.Enable)
    enableLoading(ctx: StateContext<TransitionStateModel>) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            loading: true
        })
    }

    @Action(Loading.Disable)
    disableLoading(ctx: StateContext<TransitionStateModel>) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            loading: false
        })
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
        return state.intermittentRefreshActionStack.filter(action => action.includes(stateContainer));
       }
    }

    @Selector()
    static loading(state: TransitionStateModel): boolean {
        return state.loading
    }

    @Selector()
    static loadingInformation(state: TransitionStateModel): string {
        return state.loadingInformation
    }

    @Selector()
    static currentTabIndex(state: TransitionStateModel): string {
        return state.currentTabIndex
    }
}


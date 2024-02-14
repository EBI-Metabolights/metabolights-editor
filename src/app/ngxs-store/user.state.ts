import { Action, State, StateContext } from "@ngxs/store";
import { IStudyDetail } from "../models/mtbl/mtbls/interfaces/study-detail.interface";
import { Owner, User } from "./user.actions";
import { Injectable } from "@angular/core";
import { MetabolightsService } from "../services/metabolights/metabolights.service";


export interface UserStateModel {
    user: Owner,
    userStudies: IStudyDetail[]
}

@State<UserStateModel>({
    name: 'user',
    defaults: {
        user: null,
        userStudies: []
    }
})
@Injectable()
export class UserState {
    constructor(private dataService: MetabolightsService) {}
    
    @Action(User.Studies.Get)
    GetUserStudies(ctx: StateContext<UserStateModel>, action: User.Studies.Get) {
        this.dataService.getAllStudies().subscribe((response) => {
            ctx.dispatch(new User.Studies.Set(response.data));
          });
    }

    @Action(User.Studies.Set)
    SetUserStudies(ctx: StateContext<UserStateModel>, action: User.Studies.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            userStudies: action.studies
        })
    }

    @Action(User.Set)
    SetUser(ctx: StateContext<UserStateModel>, action: User.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            user: action.user
        })
    }
}
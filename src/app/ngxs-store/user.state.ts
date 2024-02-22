import { Action, Selector, State, StateContext } from "@ngxs/store";
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
        userStudies: null
    }
})
@Injectable()
export class UserState {
    constructor(private dataService: MetabolightsService) {}
    
    @Action(User.Studies.Get)
    GetUserStudies(ctx: StateContext<UserStateModel>, action: User.Studies.Get) {
        console.log('hit user.studies.get action')
        this.dataService.getAllStudies().subscribe((response) => {
            console.log(`response data: ${response.data}`)
            const sorted = response.data.sort(
                (a, b) => +new Date(b["releaseDate"]) - +new Date(a["releaseDate"])
            )
            ctx.dispatch(new User.Studies.Set(sorted));
          });
    }

    @Action(User.Studies.Set)
    SetUserStudies(ctx: StateContext<UserStateModel>, action: User.Studies.Set) {
        console.log('hit user.studies.set action ')
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

    @Selector()
    static user(state: UserStateModel): Owner {
        return state.user
    }

    @Selector()
    static userStudies(state: UserStateModel): IStudyDetail[] {
        return state.userStudies
    }
}
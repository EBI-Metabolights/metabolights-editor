import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IStudyDetail } from "../../../models/mtbl/mtbls/interfaces/study-detail.interface";
import { Curator, Owner, User } from "./user.actions";
import { Injectable } from "@angular/core";
import { MetabolightsService } from "../../../services/metabolights/metabolights.service";
import { UserService } from "src/app/services/decomposed/user.service";

export interface UserStateModel {
    user: Owner,
    userStudies: IStudyDetail[],
    isCurator: boolean
}

@State<UserStateModel>({
    name: 'user',
    defaults: {
        user: null,
        userStudies: null,
        isCurator: false
    }
})
@Injectable()
export class UserState {
    constructor(private userService: UserService) {}
    
    @Action(User.Studies.Get)
    GetUserStudies(ctx: StateContext<UserStateModel>, action: User.Studies.Get) {
        this.userService.getAllStudies().subscribe((response) => {
            const sorted = response.data.sort(
                (a, b) => +new Date(b["releaseDate"]) - +new Date(a["releaseDate"])
            )
            ctx.dispatch(new User.Studies.Set(sorted));
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
        const isCurator = action.user.role === "ROLE_SUPER_USER" ? true : false;
        ctx.dispatch(new Curator.Set(isCurator));
        ctx.setState({
            ...state,
            user: action.user
        })
    }

    @Action(Curator.Set)
    SetCurator(ctx: StateContext<UserStateModel>, action: Curator.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            isCurator: action.curator
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

    @Selector()
    static isCurator(state: UserStateModel): boolean {
        return state.isCurator
    }
}
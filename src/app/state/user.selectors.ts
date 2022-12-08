import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MtblsUser } from "../models/mtbl/mtbls/mtbls-user.interface";


export const selectUser = createFeatureSelector<Readonly<MtblsUser>>('user')

export const selectUserStudies = createFeatureSelector<Readonly<any>>('userStudies')

export const selectApiToken = createSelector(
    selectUser,
    (user) => {
        return user.apiToken
    }
)


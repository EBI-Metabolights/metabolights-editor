import { createReducer, on } from "@ngrx/store";
import { MtblsUser } from "../models/mtbl/mtbls/mtbls-user.interface";
import { retrievedUser } from "./user.actions";


export const initialState: Readonly<MtblsUser> = {
    address: null,
    affiliation: null,
    curator: false,
    dbPassword: null,
    email: null,
    firstName: null,
    fullName: null,
    joinDate: null,
    lastName: null,
    orcid: null,
    role: null,
    status: null,
    userId: null,
    userName: null,
    userVerifyDbPassword: null,
    mobilePhoneNumber: null,
    officePhoneNumber: null,
    apiToken: null
}

export const userReducer = createReducer(
    initialState,
    on(retrievedUser, (state, { user}) => user)
);
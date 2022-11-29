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

/**
 * previous selectors referenced in:
 * /components/guide/meta/meta.component [x] removed? []
 * /components/guide/upload/upload.component [x] removed? []
 * /components/public/header/header.component [x] removed? []
 * /components/public/study/study.component [x] removed? []
 * 
 * 
 * previous dispatches referenced in:
 * /app/services.editor.service (2) [x] removed? []
 */
export const userReducer = createReducer(
    initialState,
    on(retrievedUser, (state, { user}) => user)
);
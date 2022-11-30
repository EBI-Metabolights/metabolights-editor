import { createReducer, on } from "@ngrx/store";
import { MtblsUser } from "../models/mtbl/mtbls/mtbls-user.interface";
import * as UserActions from "./user.actions";


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

export const userStudiesInitialState: Readonly<any> = {studies: []}
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
    on(UserActions.retrievedUser, (state, { user}) => user),
    on(UserActions.retrievedUserStudies)
);

/**
 * previous selectors referenced in:
 * /components/console.component [x] removed? []
 * /components/study.component [x] removed? []
 * 
 * previous dispatches referenced in:
 * /services/editor.service (3) [x] removed? []
 */
export const userStudyReducer = createReducer(
    userStudiesInitialState,
    on(UserActions.retrievedUserStudies, (state, {newStudies}) => ({...state, studies: newStudies}))

)
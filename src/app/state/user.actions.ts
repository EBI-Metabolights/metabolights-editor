import { createAction, props } from '@ngrx/store';
import { IStudyDetail, IStudyDetailWrapper } from '../models/mtbl/mtbls/interfaces/study-detail.interface';
import { MtblsUser } from '../models/mtbl/mtbls/mtbls-user.interface';


/*export const setUser = createAction(
    '[User] Set User',
    props<{ userId: string}>()
)*/

/**
 * this action is called once we have retrieved the user from the webservice.
 */


export const retrievedUser = createAction(
    '[User/API] retrieved User',
    props<{ user: Readonly<MtblsUser>}>()
)

export const retrievedUserStudies = createAction(
    '[User/API] retrieved User studies',
    props<{ newStudies: Readonly<IStudyDetail[]>}>()
)
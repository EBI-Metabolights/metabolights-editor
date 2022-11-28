import { createAction, props } from '@ngrx/store';
import { MtblsUser } from '../models/mtbl/mtbls/mtbls-user.interface';


/*export const setUser = createAction(
    '[User] Set User',
    props<{ userId: string}>()
)*/

/**
 * this action is called once we have retrieved the user from the webservice.
 */


export const retrievedUser = createAction(
    '[User/API]',
    props<{ user: Readonly<MtblsUser>}>()
)
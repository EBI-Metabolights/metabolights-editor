import { combineReducers } from 'redux'; 
import { routerReducer } from '@angular-redux/router';
import { MTBLSStudy } from './models/mtbl/mtbls/mtbls-study';
import { STUDY_INITIAL_STATE, studyReducer } from './components/study/store';
import { SHARED_INITIAL_STATE, sharedReducer } from './components/store';

export interface IAppState {
  study: MTBLSStudy;
  status: Object;
}

export const INITIAL_STATE: IAppState = { 
  study: STUDY_INITIAL_STATE,
  status: SHARED_INITIAL_STATE
}

export const rootReducer = combineReducers({
  study: studyReducer,
  status: sharedReducer,
  router: routerReducer
});
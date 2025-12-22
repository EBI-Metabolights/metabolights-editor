import { Action } from '@ngxs/store';

export namespace StudyCreation {
  export class Create {
    static readonly type = '[StudyCreation] Create';
    constructor(public payload: any) {}
  }
}

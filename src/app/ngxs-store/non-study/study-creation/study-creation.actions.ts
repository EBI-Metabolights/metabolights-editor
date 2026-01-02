import { Action } from '@ngxs/store';

export namespace StudyCreation {
  export class Create {
    static readonly type = '[StudyCreation] Create';
    constructor(public payload: any) {}
  }

  export class Reset {
    static readonly type = '[StudyCreation] Reset';
  }

  // Factors
  export class SetFactors {
    static readonly type = '[StudyCreation] Set Factors';
    constructor(public factors: any[]) {}
  }
  export class AddFactor {
    static readonly type = '[StudyCreation] Add Factor';
    constructor(public factor: any) {}
  }
  export class UpdateFactor {
    static readonly type = '[StudyCreation] Update Factor';
    constructor(public factor: any, public index: number) {}
  }
  export class RemoveFactor {
    static readonly type = '[StudyCreation] Remove Factor';
    constructor(public index: number) {}
  }

  // Design Descriptors
  export class SetDesignDescriptors {
    static readonly type = '[StudyCreation] Set Design Descriptors';
    constructor(public descriptors: any[]) {}
  }
  export class AddDesignDescriptor {
    static readonly type = '[StudyCreation] Add Design Descriptor';
    constructor(public descriptor: any) {}
  }
  export class UpdateDesignDescriptor {
    static readonly type = '[StudyCreation] Update Design Descriptor';
    constructor(public descriptor: any, public index: number) {}
  }
  export class RemoveDesignDescriptor {
    static readonly type = '[StudyCreation] Remove Design Descriptor';
    constructor(public index: number) {}
  }

  // Contacts
  export class SetContacts {
    static readonly type = '[StudyCreation] Set Contacts';
    constructor(public contacts: any[]) {}
  }
  export class AddContact {
    static readonly type = '[StudyCreation] Add Contact';
    constructor(public contact: any) {}
  }
  export class UpdateContact {
    static readonly type = '[StudyCreation] Update Contact';
    constructor(public contact: any, public index: number) {}
  }
  export class RemoveContact {
    static readonly type = '[StudyCreation] Remove Contact';
    constructor(public index: number) {}
  }
}

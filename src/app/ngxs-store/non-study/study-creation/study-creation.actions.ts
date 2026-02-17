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

  // Funders
  export class SetFunders {
    static readonly type = '[StudyCreation] Set Funders';
    constructor(public funders: any[]) {}
  }
  export class AddFunder {
    static readonly type = '[StudyCreation] Add Funder';
    constructor(public funder: any) {}
  }
  export class UpdateFunder {
    static readonly type = '[StudyCreation] Update Funder';
    constructor(public funder: any, public index: number) {}
  }
  export class RemoveFunder {
    static readonly type = '[StudyCreation] Remove Funder';
    constructor(public index: number) {}
  }

  // Related Datasets
  export class SetRelatedDatasets {
    static readonly type = '[StudyCreation] Set Related Datasets';
    constructor(public datasets: any[]) {}
  }
  export class AddRelatedDataset {
    static readonly type = '[StudyCreation] Add Related Dataset';
    constructor(public dataset: any) {}
  }
  export class UpdateRelatedDataset {
    static readonly type = '[StudyCreation] Update Related Dataset';
    constructor(public dataset: any, public index: number) {}
  }
  export class RemoveRelatedDataset {
    static readonly type = '[StudyCreation] Remove Related Dataset';
    constructor(public index: number) {}
  }
}

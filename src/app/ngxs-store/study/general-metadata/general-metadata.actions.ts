import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface"
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface"
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person"
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication"

export interface Title {
    title: string
}

export class GetGeneralMetadata {
    static readonly type ='[general] Get All General Metadata'
    constructor(public studyId: string, public readonly: boolean) {}
}
export namespace Identifier {
    export class Set {
        static readonly type = '[general] Set Study Identifier'
        constructor(public id: string) {}
    }
}

export namespace Title {
    export class Set {
        static readonly type = '[general] Set Study Title'
        constructor(public title: string) {}
    }
    export class Update {
        static readonly type = '[general] Update Study Title'
        constructor(public title: Title) {}
    }
}


export namespace StudyAbstract {
    export class Update {
        static readonly type = '[application] Update Study Abstract'
        constructor(public description: string) {}
    }

    export class Set {
        static readonly type = '[general] Set Study Abstract'
        constructor(public abstract: string) {}
    }
}



export class SetStudySubmissionDate {
    static readonly type = '[general] Set Study Submission Date'
    constructor(public date: Date) {}
}

export namespace StudyReleaseDate {
    export class Set {
        static readonly type = '[general] Set Study Release Date'
        constructor(public date: Date) {}
    }

    export class Update {
        static readonly type = '[general] Update Study Release Date'
        constructor(public date: string) {}
    }

}


export namespace StudyStatus {

    export class Update {
        static readonly type = '[general] Change Study Status'
        constructor(public status: string) {}
    }

    export class Set{
        static readonly type = '[general] Set Study Status'
        constructor(public status: string) {}
    }

}

export namespace CurationRequest {

  export class Update {
      static readonly type = '[general] Change Curation Request'
      constructor(public curationRequest: string) {}
  }

  export class Set{
      static readonly type = '[general] Set Curation Request'
      constructor(public curationRequest: string) {}
  }

}

export class SetStudyReviewerLink {
    static readonly type = '[general] Set Study Reviewer Link'
    constructor(public link: string) {}
}

export namespace Publications {
    export class Set {
        static readonly type = '[general] Set Study Publications'
        constructor(public publications: IPublication[], public extend: boolean = false, public update: boolean = false) {}
    }

    export class Get {
        static readonly type = '[general] Get Study Publications'
        constructor() {}
    }

    export class Add {
        static readonly type = '[general] Add Study Publication'
        constructor(public publication: any) {}
    }

    export class Update {
        static readonly type = '[general] Update Study Publication'
        constructor(public title: string, public publication: any) {}
    }

    export class Delete {
        static readonly type = '[general] Delete Study Publication'
        constructor(public title: string) {}
    }
}

export namespace People {
    export class Set {
        static readonly type = '[general] Set Study People'
        constructor(public people: IPerson[], public extend: boolean = false) {}
    }

    export class Get {
        static readonly type = '[general] Get Study People'
        constructor() {}
    }

    export class Update {
        static readonly type = '[general] Update Study Person'
        constructor(public body: Record<string, any>, public existingEmail?: string, public existingFullName?: string) {}
    }

    export class Add {
        static readonly type = '[general] Add Study Person'
        constructor(public body: Record<string, any>) {}
    }

    export class Delete {
        static readonly type = '[general] Delete Study Person'
        constructor(public email: string, public fullName: string) {}
    }

    export class GrantSubmitter {
        static readonly type = '[general] Grant Submitter Status'
        constructor(public email: string) {}
    }

}



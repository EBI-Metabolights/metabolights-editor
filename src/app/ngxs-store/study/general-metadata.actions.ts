import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface"
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface"
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person"
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication"


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
}



export class SetStudyAbstract {
    static readonly type = '[general] Set Study Abstract'
    constructor(public abstract: string) {}
}

export class SetStudySubmissionDate {
    static readonly type = '[general] Set Study Submission Date'
    constructor(public date: Date) {}
}

export class SetStudyReleaseDate {
    static readonly type = '[general] Set Study Release Date'
    constructor(public date: Date) {}
}

export class SetStudyStatus {
    static readonly type = '[general] Set Study Status'
    constructor(public status: string) {}
}

export class SetStudyReviewerLink {
    static readonly type = '[general] Set Study Reviewer Link'
    constructor(public link: string) {}
}

export namespace Publications {
    export class Set {
        static readonly type = '[general] Set Study Publications'
        constructor(public publications: IPublication[]) {}
    }
    
    export class Add {
        static readonly type = '[general] Add Study Publication'
        constructor(public publication: IPublication) {}
    }
}

export namespace People {
    export class Set {
        static readonly type = '[general] Set Study People'
        constructor(public people: IPerson[]) {}
    }

    export class Add {
        static readonly type = '[general] Add Study Person'
        constructor(public person: IPerson) {}
    }

}


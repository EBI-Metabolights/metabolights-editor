import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface"
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface"
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person"
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication"
import { DatasetLicense } from "src/app/services/decomposed/dataset-license.service"

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
    constructor(public date: string) {}
}

export namespace StudyReleaseDate {
    export class Set {
        static readonly type = '[general] Set Study Release Date'
        constructor(public date: string) {}
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

export namespace RevisionNumber {

  export class New {
      static readonly type = '[general] New Revision Number'
      constructor(public revisionComment: string) {}
  }

  export class Set{
      static readonly type = '[general] Set Revision Number '
      constructor(public revisionNumber: number) {}
  }

}

export namespace RevisionDateTime {

  export class Update {
      static readonly type = '[general] Change Revision DateTime'
      constructor(public revisionDatetime: string) {}
  }

  export class Set{
      static readonly type = '[general] Set Revision DateTime'
      constructor(public revisionDatetime: string) {}
  }
}

export namespace PublicFtpUrl {
  export class Set{
      static readonly type = '[general] Set Public FTP URL'
      constructor(public publicFtpUrl: string) {}
  }
}
export namespace PublicHttpUrl {
  export class Set{
      static readonly type = '[general] Set Public HTTP URL'
      constructor(public publicHttpUrl: string) {}
  }
}

export namespace PublicGlobusUrl {
  export class Set{
      static readonly type = '[general] Set Public Globus URL'
      constructor(public publicGlobusUrl: string) {}
  }
}
export namespace FirstPrivateDate {
  export class Set{
      static readonly type = '[general] Set First Private Date'
      constructor(public firstPrivateDate: string) {}
  }
}

export namespace FirstPublicDate {
  export class Set{
      static readonly type = '[general] Set First Public Date'
      constructor(public firstPublicDate: string) {}
  }
}

export namespace PublicAsperaPath {
  export class Set{
      static readonly type = '[general] Set Public Aspera Path'
      constructor(public publicAsperaPath: string) {}
  }
}

export namespace RevisionStatus {

  export class Set{
      static readonly type = '[general] Set Revision Status'
      constructor(public revisionStatus: number) {}
  }

}
export namespace RevisionComment {

  export class Set{
      static readonly type = '[general] Set Revision Comment'
      constructor(public revisionComment: string) {}
  }

}

export namespace RevisionTaskMessage {

  export class Set{
      static readonly type = '[general] Set Revision Task Message'
      constructor(public revisionTaskMessage: string) {}
  }

}

export class SetStudyReviewerLink {
    static readonly type = '[general] Set Study Reviewer Link'
    constructor(public link: string) {}
}

export namespace Publications {
    export class Set {
        static readonly type = '[general] Set Study Publications'
        constructor(public publications: IPublication[], public extend: boolean = false, public update: boolean = false, public oldTitle: string = null) {}
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
        constructor(public people: IPerson[], public extend: boolean = false, public updated: boolean = false) {}
    }

    export class Get {
        static readonly type = '[general] Get Study People'
        constructor() {}
    }

    export class Update {
        static readonly type = '[general] Update Study Person'
        constructor(public body: Record<string, any>, public email: string, public fullName: string) {}
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

export namespace DatasetLicenseNS {
    export class ConfirmAgreement {
        static readonly type = '[general] Confirm Dataset License Agreement'
        constructor(public studyId: string) {}
    }

    export class GetDatasetLicense {
        static readonly type = '[general] Get Dataset License'
        constructor(public studyId: string) {}
    }
    export class SetDatasetLicense {
        static readonly type = '[general] Set Dataset License'
        constructor(public license: DatasetLicense) {}
    }
}

export class ResetGeneralMetadataState {
    static readonly type = '[general] Reset General Metadata State'
    constructor() {}
}


import { ISample } from "src/app/models/mtbl/mtbls/interfaces/sample.interface";


export namespace Samples {
    export class Set {
        static readonly type = '[samples] Set Study Samples'
        constructor(public samples: any) {}
    }


    export class Get {
        static readonly type = '[samples] Get Study Samples'
    }

    export class OrganiseAndPersist {
        static readonly type = '[samples] Organise and Persist Sample Sheet'
        constructor(public sampleSheetFilename: string) {}
    }
}

export namespace Organisms {
    export class Set {
        static readonly type = '[samples] Set Study Organisms'
        constructor(public organisms: any) {}
    }
}
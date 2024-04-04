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

    export class AddRows {
        static readonly type = '[samples] Add Table Rows'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>) {}
    }

    export class DeleteRows {
        static readonly type = '[samples] Delete Table Rows'
        constructor(public filename: string, public rowIds: any) {}
    }

    export class AddColumns {
        static readonly type = '[samples] Add Table Columns'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>){}
    }

    export class UpdateCells {
        static readonly type = '[samples] Update Cells'
        constructor(public filename: string, public cellsToUpdate: Record<string, any>){}
    }
}

export namespace Organisms {
    export class Set {
        static readonly type = '[samples] Set Study Organisms'
        constructor(public organisms: any) {}
    }
}
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";

export namespace AssayList {

    export class Get {
        static readonly type = '[assay] Get Assay List'
        constructor(public id: string = null) {}
    }

    export class Set {
        static readonly type = '[assay] Set Assay List'
        constructor(public assays: IAssay[]){}
    }

}

export namespace Assay {
    export class Add {
        static readonly type = '[assay] Add New Assay'
        constructor(public assay: any) {}
    }
    export class OrganiseAndPersist {
        static readonly type = '[assay] Organise and Persist Assay Sheet'
        constructor(public assaySheetFilename: string) {}
    }
    export class Set {
        static readonly type = '[assay] Set Study Assay'
        constructor(public assay: any) {}
    }
}
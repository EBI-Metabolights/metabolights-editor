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
        constructor(public assay: any, public id: string = null) {}
    }
    export class OrganiseAndPersist {
        static readonly type = '[assay] Organise and Persist Assay Sheet'
        constructor(public assaySheetFilename: string) {}
    }
    export class Set {
        static readonly type = '[assay] Set Study Assay'
        constructor(public assay: any) {}
    }

    export class Delete {
        static readonly type = '[assay] Delete Study Assay'
        constructor(public assay: string, public id: string = null) {}
    }

    export class AddColumn {
        static readonly type = '[assay] Add Columns to Assay Sheet'
        constructor(public assay: string, public body: Record<string, any>, public tableType: string, public id: string, public metaInfo: any = null ){}
    }
    export class AddRows {
        static readonly type ='[assay] Add Rows'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>) {}

    }

    export class DeleteRows {
        static readonly type = '[assay] Delete Rows'
        constructor(public filename: string, public rowIds: any) {}
    }

    export class UpdateCells {
        static readonly type = '[assay] Update Cells'
        constructor(public filename: string, public cellsToUpdate: Record<string, any>){}
    }

}

export namespace MAFList {

    export class Get {
        static readonly type = '[maf] Get MAF List'
        constructor() {}
    }

    export class Set {
        static readonly type = '[maf] Set MAF List'
        constructor(public mafs: any[]) {} // TODO: properly type the mafs parameter
    }
}


export namespace MAF {

    export class Organise {
        static readonly type = '[maf] Organise MAF'
        constructor(public filename: string, public studyId: string) {}
    }

    export class Set {
        static readonly type = '[maf] Set Study MAF'
        constructor(public maf: any) {}
    }

    export class AddRows {
        static readonly type = '[maf] Add Rows'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>, public studyId: string) {}

    }

    export class UpdateRows {
        static readonly type = '[maf] Update Rows'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>, public studyId: string) {}
    }

    export class DeleteRows {
        static readonly type = '[maf] Delete Rows'
        constructor(public filename: string, public rowIds: any, public studyId: string) {}
    }

    export class UpdateCells {
        static readonly type = '[maf] Update Cells'
        constructor(public filename: string, public cellsToUpdate: Record<string, any>, public studyId: string){}

    }

}

export class ResetMAFState {
    static readonly type = '[maf] Reset MAF State'
    constructor() {}
}
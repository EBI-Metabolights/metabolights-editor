
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
        constructor(public filename: string) {}
    }

    export class Set {
        static readonly type = '[maf] Set Study MAF'
        constructor(public maf: any) {}
    }

}
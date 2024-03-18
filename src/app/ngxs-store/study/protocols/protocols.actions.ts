export namespace Protocols {
    export class Set {
        static readonly type = '[protocols] Set Protocols'
        constructor(public rawProtocols: any[]) {}
    }

    export class Get {
        static readonly type = '[protocols] Get Protocols'
        constructor() {}
    }
}
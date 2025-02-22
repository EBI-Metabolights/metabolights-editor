import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface"

export namespace Protocols {
    export class Set {
        static readonly type = '[protocols] Set Protocols'
        constructor(public rawProtocols: any[], public extend: boolean = false, public updatedProtocol: boolean = false) {}
    }

    export class Get {
        static readonly type = '[protocols] Get Protocols'
        constructor() {}
    }

    export class Add {
        static readonly type = '[protocols] Add New Protocol'
        constructor(public name: string, public protocol: Record<string, any>) {}
    }

    export class Update {
        static readonly type = '[protocols] Update Existing Protocol'
        constructor(public name: string, public protocol: Record<string, any>) {}
    }

    export class Delete {
        static readonly type = '[protocols] Delete Existing Protocol'
        constructor(public name: string) {}

    }
}

export namespace ProtocolGuides {
    export class Get {
        static readonly type = '[protocols] Get Protocol Guides'
        constructor() {}
    }

    export class Set {
        static readonly type = '[protocols] Set Protocol Guides'
        constructor(public guides: Record<string, any>) {}
    }
}

export class ResetProtocolsState {
    static readonly type = '[protocols] Reset Protocols State'
    constructor() {}
}
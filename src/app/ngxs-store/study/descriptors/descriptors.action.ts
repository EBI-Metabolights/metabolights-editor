import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology"
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor"

export namespace Descriptors {

    export class Get {
        static readonly type = '[descriptors] Get Design Descriptors'
        constructor(public id: string) {}
    }
    export class Set {
        static readonly type = '[descriptors] Set Design Descriptors'
        constructor(public rawDescriptors: any[], public extend: boolean = false) {}
    }

    export class New {
        static readonly type = '[descriptors] New Design Descriptor'
        constructor(public descriptor: any, public id: string) {}
    }

    export class Update {
        static readonly type = '[descriptors] Update Existing Design Descriptor'
        constructor(public annotationValue: string, public descriptor: any, public id: string) {}
    }

    export class Delete {
        static readonly type = '[descriptors] Delete Design Descriptor'
        constructor(public annotationValue: string, public id: string) {}
    }
}

export namespace Factors {
    export class Set {
        static readonly type = '[descriptors] Set Factors'
        constructor(public rawFactors: any[]) {}
    }

    export class Update {
        static readonly type = '[descriptors] Update Study Factors'
        constructor(public factor: MTBLSFactor) {}
    }

}
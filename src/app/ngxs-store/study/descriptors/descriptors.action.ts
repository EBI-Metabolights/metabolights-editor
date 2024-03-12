import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology"
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor"

export namespace Descriptors {
    export class Set {
        static readonly type = '[descriptors] Set Design Descriptors'
        constructor(public rawDescriptors: any[]) {}
    }

    export class Update {
        static readonly type = '[descriptors] Update Design Descriptors'
        constructor(public descriptor: Ontology) {}
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
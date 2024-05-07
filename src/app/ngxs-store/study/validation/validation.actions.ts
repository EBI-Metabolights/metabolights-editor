import { ValidationReportInterface } from "src/app/components/study/validations/validations-protoype/interfaces/validation-report.interface"

export namespace EditorValidationRules {
    export class Get {
        static readonly type = '[validation] Get Validation Rules'
        constructor() {}
    }
    export class Set {
        static readonly type = '[validation] Set Validation Rules'
        constructor(public rules: any) {}
    }
}

export namespace ValidationReport {

    export class Refresh {
        static readonly type = '[validation] Refresh Validation Report'
        constructor(){}
    }
    export class Get {
        static readonly type = '[validation] Get Validation Report'
        constructor() {}
    }
    export class Set {
        static readonly type = '[validation] Set Validation Report'
        constructor(public report: any) {}
    }

    export class Override {
        static readonly type = '[validation] Override Validation Rule'
        constructor(public rule: any) {}
    }

    export class ContinualRetry {
        static readonly type = '[validation] Continually Poll Validation Service'
        constructor(public retries: number = 5, public interval: number = 3000 ) {}
    }
}

export namespace NewValidationReport {
    export class Get {
        static readonly type = '[validation] Get New Validation Report'
        constructor(public ws3: boolean = false) {}
    }

    export class Set {
        static readonly type = '[validation] Set New Validation Report'
        constructor(public report: ValidationReportInterface) {}
    }
}
import { ValidationPhase, Ws3ValidationReport } from "src/app/components/study/validations-v2/interfaces/validation-report.interface"
import { ViolationType } from "src/app/components/study/validations-v2/interfaces/validation-report.types"
import { ValidationTask } from "./validation.state"


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
        constructor(public studyId: string){}
    }
    export class Get {
        static readonly type = '[validation] Get Validation Report'
        constructor(public studyId: string) {}
    }
    export class Set {
        static readonly type = '[validation] Set Validation Report'
        constructor(public report: any) {}
    }

    export class Override {
        static readonly type = '[validation] Override Validation Rule'
        constructor(public rule: any, public studyId: string) {}
    }

    export class ContinualRetry {
        static readonly type = '[validation] Continually Poll Validation Service'
        constructor(public studyId: string, public retries: number = 5, public interval: number = 3000,  ) {}
    }
}

export namespace ValidationReportV2 {
    
    export class InitialiseValidationTask {
        static readonly type = '[validation] Init New validation Task'
        constructor(public proxy: boolean = false, public studyId: string) {}
    }
    export class Get {
        static readonly type = '[validation] Get New Validation Report'
        constructor(public studyId: string, public taskId?: string, public test: boolean = false, public proxy: boolean = false) {}
    }


    export class Set {
        static readonly type = '[validation] Set New Validation Report'
        constructor(public report: Ws3ValidationReport) {}
    }

    export class SetTaskID {
        static readonly type = '[validation] Set Validation Task ID'
        constructor(public id: string) {}
    }

    export class SetValidationStatus {
        static readonly type = '[validation] Set Validation Status'
        constructor(public status: ViolationType) {}
    }

    export class SetLastRunTime {
        static readonly type = '[validation] Set Last Validation Run Time'
        constructor(public time: string) {}
    }

    export class SetCurrentTask {
        static readonly type = '[validation] Set Current Task'
        constructor(public task: ValidationTask) {}
    }

    export namespace History {
        export class Get {
            static readonly type = '[validation] Get Validation History'
            constructor(public studyId: string) {}
        }

        export class Set {
            static readonly type = '[validation] Set Validation History'
            constructor(public history: Array<ValidationPhase>) {}
        }
    }
}

export class SetInitialLoad {
    static readonly type = '[validation] Set Initial Load'
    constructor(public set: boolean) {}
}

export class ResetValidationState {
    static readonly type = '[validation] Reset Validation State'
    constructor() {}
}
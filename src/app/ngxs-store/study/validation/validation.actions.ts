
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
    export class Get {
        static readonly type = '[validation] Get Validation Report'
        constructor() {}
    }
    export class Set {
        static readonly type = '[validation] Set Validation Report'
        constructor(public report: any) {}
    }
}
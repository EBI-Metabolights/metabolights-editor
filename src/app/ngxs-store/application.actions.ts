
export class SetStudyError {
    static readonly type = '[application] Set Study Error'
    constructor(public error: boolean) {}
}

export class SetReadonly {
    static readonly type = '[application] Set Study Readonly'
    constructor(public readonly: boolean) {}
}
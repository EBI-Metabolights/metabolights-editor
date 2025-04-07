
export namespace Loading {

    export class Toggle {
        static readonly type = '[transitions] Toggle Loading'
    }
    export class Enable {
        static readonly type = '[transitions] Enable Loading'
    }
    export class Disable {
        static readonly type = '[transitions] Disable Loading'
    }
}

export class SetLoadingInfo {
    static readonly type = '[transitions] Set LoadingInfo';
    constructor(public info: string) {}
}

export class SetTabIndex {
    static readonly type = '[transitions] Set Tab Index';
    constructor(public index: string) {}
}

export namespace IntermittentRefreshActionStack {

    export class Sync {
        static readonly type = '[transitions] Sync Intermittent Refresh Action Stack'
        constructor(public actionStack: string[]) {}
    }
}



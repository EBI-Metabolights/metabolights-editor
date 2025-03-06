export interface Owner {
    apiToken: string;
    role: string;
    email: string;
    status: string;
    partner: boolean;
}

export namespace User {

    export class Get {
        static readonly type = '[user] Get'
    }
    export class Set {
        static readonly type = '[user] Set'
        constructor(public user: Owner){}
    }

    export namespace Studies {
        export class Get {
            static readonly type = '[user] Get Studies'
        }
        export class Set {
            static readonly type = '[user] Set Studies'
            constructor(public studies: any[]){}
        }

    }
}

export namespace Curator {
    export class Set {
        static readonly type = '[user] Set Curator'
        constructor(public curator: boolean) {}
    }
}


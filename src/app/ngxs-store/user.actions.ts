export interface Owner {
    apiToken: string;
    role: string;
    email: string;
    status: string;
}

export namespace User {
    export class Set {
        static readonly type = '[user] Set'
        constructor(user: Owner){}
    }

    export class Get {
        static readonly type = '[user] Get'
    }
}
import { Language } from "src/app/models/mtbl/mtbls/interfaces/language-mapping.interface"
import { StudyPermission } from "../../../services/headers"
import { MtblsBackendVersion, MtblsEditorVersion } from "./application.state"
import { ApiVersionInfo } from "src/app/models/mtbl/mtbls/interfaces/common"
import { TransferStatus } from "src/app/services/transfer-healthcheck.service"

export class SetStudyError {
    static readonly type = '[application] Set Study Error'
    constructor(public error: boolean) {}
}

export class SetReadonly {
    static readonly type = '[application] Set Study Readonly'
    constructor(public readonly: boolean) {}
}

export namespace EditorVersion {
    export class Set {
        static readonly type = '[application] Set Editor Version'
        constructor(public version: MtblsEditorVersion) {}
    }
    export class Get {
        static readonly type = '[application] Get Editor Version'
    }
    
}

export namespace BackendVersion {
    export class Set {
        static readonly type = '[application] Set Backend Version'
        constructor(public version: ApiVersionInfo) {}
    }
    export class Get {
        static readonly type = '[application] Get Backend Version'
    }
}



export class SetSelectedLanguage {
    static readonly type = '[application] Set Selected Language'
    constructor(public language: string) {}
}

export namespace GuidesMappings {
    export class Set {
        static readonly type = '[application] Set Guides Mappings'
        constructor(public mappings: Record<string, any>) {}
    }
    export class Get {
        static readonly type = '[application] Get Guides Mappings'
    }
}

export namespace Guides {
    export class Set {
        static readonly type = '[application] Set Guides'
        constructor(public guides: any) {} // we should type this
    }

    export class Get {
        static readonly type = '[application] Get Guides'
        constructor(public language: Language, public setLanguage: boolean = false) {}
    }
    
}


export namespace StudyPermissionNS {
    export class Set {
        static readonly type = '[application] Set Study Permission'
        constructor(public permission: StudyPermission) {}
    }

    export class ResetStudyPermission {
        static readonly type = '[application] Reset Study Permission'
    }
}

export namespace BannerMessage {
    export class Set {
        static readonly type = '[application] Set Banner Message'
        constructor(public message: string) {}
    }
    export class Get {
        static readonly type = '[application] Get Banner Message'
    }
}

export namespace MaintenanceMode {
    export class Set {
        static readonly type = '[application] Set Maintenance Mode'
        constructor(public maintenanceEnabled: boolean) {}
    }
    export class Get {
        static readonly type = '[application] Get Maintenance Mode'
    }
}

export namespace DefaultControlLists {
    export class Set {
        static readonly type = '[application] Set Default Control Lists'
        constructor(public lists: any) {} // we should type this
    }
    export class Get {
        static readonly type = '[application] Get Default Control Lists'
    }
}

export class SetProtocolExpand {
    static readonly type = '[application] Set Protocol Expand'
    constructor(public expand: boolean) {}
}

export class SetTransferStatus {
    static readonly type = '[application] Set Transfer Status'
    constructor(public status: TransferStatus) {}
}



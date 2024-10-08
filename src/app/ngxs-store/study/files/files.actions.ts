import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface"

export namespace UploadLocation {
    export class Set {
        static readonly type = '[files] Set Upload Location'
        constructor(public loc: string) {}
    }
}

export namespace ObfuscationCode {
    export class Set {
        static readonly type = '[files] Set Obfuscation Code'
        constructor(public obf: string) {}
    }
}

export namespace FilesLists {
    export class SetStudyFiles {
        static readonly type = '[files] Set Study Files'
        constructor(public files: IStudyFiles) {}
    }
}

export namespace Operations {
    /**
     * Get all files and subdirectories by directly scanning the study directory
     */
    export class GetFilesTree {
        static readonly type = '[files] Get Study Files'

        /**
         * 
         * @param id Study ID
         * @param includeSubDir Whether to include subdirectories in the response
         * @param dir Whether to only list the contents of a specific directory
         * @param parent If listing a specific directory, which parent directory to start from (accounts for scenarios like DERIVED_FILES/POS and RAW_FILES/POS)
         * @param location Unclear
         */
        constructor(
            public id: string, 
            public includeSubDir: boolean, 
            public dir: string, 
            public parent: string, 
            public location: 'study') { }
    }

    export class GetPreGeneratedFilesList {
        static readonly type = '[files] Get Pregenerated Files List'
    }

    export class GetFreshFilesList {
        static readonly type = '[files] Get Fresh Files List'
        constructor(public force: boolean, public readonly: boolean = false, public id: string = null) {}
    }
}

export class ResetFilesState {
    static readonly type = '[files] Reset Files State'
    constructor() {}
}
import { D } from "@angular/cdk/keycodes";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";

export namespace AssayList {

    export class Get {
        static readonly type = '[assay] Get Assay List'
        constructor(public id: string = null) {}
    }

    export class Set {
        static readonly type = '[assay] Set Assay List'
        constructor(public assays: IAssay[]){}
    }

}

export namespace Assay {
    export class Add {
        static readonly type = '[assay] Add New Assay'
        constructor(public assay: any, public id: string = null) {}
    }
    export class OrganiseAndPersist {
        static readonly type = '[assay] Organise and Persist Assay Sheet'
        constructor(public assaySheetFilename: string, public studyId: string) {}
    }
    export class Set {
        static readonly type = '[assay] Set Study Assay'
        constructor(public assay: any) {}
    }

    export class Delete {
        static readonly type = '[assay] Delete Study Assay'
        constructor(public assay: string, public studyId: string) {}
    }

    export class AddColumn {
        static readonly type = '[assay] Add Columns to Assay Sheet'
        constructor(public assay: string, public body: Record<string, any>, public tableType: string, public studyId: string, public metaInfo: any = null ){}
    }
    export class AddRows {
        static readonly type ='[assay] Add Rows'
        constructor(public filename: string, public body: any, public metaInfo: Record<string, any>, public studyId: string) {}

    }

    export class DeleteRows {
        static readonly type = '[assay] Delete Rows'
        constructor(public filename: string, public rowIds: any, public studyId: string) {}
    }

    export class UpdateCells {
        static readonly type = '[assay] Update Cells'
        constructor(public filename: string, public cellsToUpdate: Record<string, any>, public studyId: string){}
    }

}

export namespace TemplateRow {

    export class GetTemplateRows {
        static readonly type = '[assay] Get Template Rows'
        constructor(public assayFiles: IAssay[] | StudyFile[]){}
    }

    export class SetTemplateRow {
        static readonly type = '[assay] Set Template Row'
        constructor(public templateRow: any, public attr: string) {}
    }

}

export class ResetAssayState {
    static readonly type = '[assay] Reset Assay State'
    constructor(){}
}
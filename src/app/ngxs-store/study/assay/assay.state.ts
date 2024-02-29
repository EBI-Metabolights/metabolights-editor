import { Injectable } from "@angular/core";
import { Action, Select, Selector, State, StateContext, Store } from "@ngxs/store";
import { Assay, AssayList } from "./assay.actions";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { FilesState } from "../files/files.state";
import { Observable } from "rxjs";
import { StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { AssaysService } from "src/app/services/decomposed/assays.service";
import { SetLoadingInfo } from "../../transitions.actions";
import { MAF } from "../maf/maf.actions";

export interface AssayStateModel {
    assayList: IAssay[],
    assays: Record<string, any>;
}

@State<AssayStateModel>({
    name: 'assay',
    defaults: {
        assayList: null,
        assays: {}
    }
})
@Injectable()
export class AssayState {

    @Select()

    @Select(FilesState.getAssaySheets) assaySheets$: Observable<StudyFile[]>

    constructor(private store: Store, private assaysService: AssaysService) { }

    @Action(AssayList.Get)
    GetAssayList(ctx: StateContext<AssayStateModel>, action: AssayList.Get) {
        this.store.dispatch(new SetLoadingInfo(this.assaysService.loadingMessage));
        this.assaySheets$.subscribe(
            (sheets) => {
                sheets.forEach((sheet) => {
                    ctx.dispatch(new Assay.OrganiseAndPersist(sheet.file));
                });
            }
        )

    }

    @Action(Assay.OrganiseAndPersist)
    OrganiseAndPersist(ctx: StateContext<AssayStateModel>, action: Assay.OrganiseAndPersist) {
        this.assaysService.getAssaySheet(action.assaySheetFilename).subscribe(
            (data) => {
                const assay = {};
                assay["name"] = action.assaySheetFilename;
                assay["meta"] = this.assaysService.extractAssayDetails(assay);
                const columns = [];
                Object.keys(data.header).forEach((key) => {
                    const fn = "element['" + key + "']";
                    columns.push({
                        columnDef: key,
                        sticky: "false",
                        header: key,
                        cell: (element) => eval(fn),
                    });
                });
                let displayedColumns = columns.map((a) => a.columnDef);
                displayedColumns.unshift("Select");
                displayedColumns = displayedColumns.filter(
                    (key) =>
                        key.indexOf("Term Accession Number") < 0 &&
                        key.indexOf("Term Source REF") < 0
                );
                data["columns"] = columns;
                data["displayedColumns"] = displayedColumns;
                data["file"] = action.assaySheetFilename;
                data.data.rows ? (data["rows"] = data.data.rows) : (data["rows"] = []);
                delete data.data;
                assay["data"] = data;
                const protocols = [];
                protocols.push("Sample collection");
                if (data["rows"].length > 0) {
                    columns.forEach((c) => {
                        if (c.header.indexOf("Protocol REF") > -1) {
                            protocols.push(data["rows"][0][c.header]);
                        }
                    });
                }
                assay["protocols"] = protocols;

                const mafFiles = [];
                data["rows"].forEach((row) => {
                    // assert that this given value in the row is a string, as we _know_ it can only be a string.
                    const assertedRow = row["Metabolite Assignment File"] as string;
                    const mafFile = assertedRow.replace(/^[ ]+|[ ]+$/g, "");
                    if (mafFile !== "" && mafFiles.indexOf(mafFile) < 0) {
                        mafFiles.push(mafFile);
                    }
                });
                mafFiles.forEach((f) => {
                    this.store.dispatch(new MAF.Organise(f))
                });
                assay["mafs"] = mafFiles;
                ctx.dispatch(new Assay.Set(assay))
            
    })
}

@Action(Assay.Set)
SetStudyAssay(ctx: StateContext<AssayStateModel>, action: Assay.Set) {
    const state = ctx.getState();
    const tempAssays = Object.assign({}, state.assays);
    tempAssays[action.assay.name] = action.assay;
    ctx.setState({
        ...state,
        assays: tempAssays
    });
}

@Action(AssayList.Set)
SetAssayList(ctx: StateContext<AssayStateModel>, action: AssayList.Set) {
    const state = ctx.getState();
    ctx.setState({
        ...state,
        assayList: action.assays
    });
}

@Selector()
static assayList(state: AssayStateModel): IAssay[] {
    return state.assayList
}
}
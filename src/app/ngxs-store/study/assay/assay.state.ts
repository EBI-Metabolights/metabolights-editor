import { Injectable } from "@angular/core";
import { Action, Select, Selector, State, StateContext, Store, createSelector } from "@ngxs/store";
import { Assay, AssayList, TemplateRow } from "./assay.actions";
import { IAssay } from "src/app/models/mtbl/mtbls/interfaces/assay.interface";
import { FilesState } from "../files/files.state";
import { Observable, Subject, forkJoin, of } from "rxjs";
import { IStudyFiles, StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { AssaysService } from "src/app/services/decomposed/assays.service";
import { SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { MAF } from "../maf/maf.actions";
import { Operations } from "../files/files.actions";
import { ApplicationState } from "../../non-study/application/application.state";
import { Protocols } from "../protocols/protocols.actions";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { TemplateRowCollection } from "src/app/models/row-template-collection";
import { RowTemplateService } from "src/app/services/row-template/row-template.service";
import { filter, map, take } from "rxjs/operators";

export interface AssayStateModel {
    assayList: IAssay[],
    assays: Record<string, any>;
    templateRows: TemplateRowCollection;
}

@State<AssayStateModel>({
    name: 'assay',
    defaults: {
        assayList: null,
        assays: {},
        templateRows: new TemplateRowCollection()
    }
})
@Injectable()
export class AssayState {

    @Select(FilesState.getAssaySheets) assaySheets$: Observable<StudyFile[]>
    @Select(FilesState.files) files$: Observable<IStudyFiles>
    @Select(ApplicationState.readonly) readonly$: Observable<boolean>;

    private templatesLoadedSubject = new Subject<string>();
    private readonly: boolean = null;

    constructor(
        private store: Store,
        private assaysService: AssaysService,
        private generalMetadataService: GeneralMetadataService,
        private rowTemplateService: RowTemplateService) { }

    @Action(AssayList.Get)
    GetAssayList(ctx: StateContext<AssayStateModel>, action: AssayList.Get) {
        this.store.dispatch(new SetLoadingInfo(this.assaysService.loadingMessage));
        if (action.id) {
            this.generalMetadataService.getStudyGeneralMetadata(action.id).pipe(take(1)).subscribe(
                (response) => {
                    let assayFiles = response.isaInvestigation.studies[0].assays;
                    ctx.dispatch(new AssayList.Set(assayFiles));
                    this.readonly$.pipe(take(1)).subscribe((readonly) => {
                        this.readonly = readonly;
                        this.templatesLoadedSubject.subscribe((val) => {
                            assayFiles.forEach((sheet) => {
                                ctx.dispatch(new Assay.OrganiseAndPersist(sheet.filename));
                            });
                        });

                        /**  want to load the templates first so they get interpolated
                         could later change to use some RxJs stuff to wait for Assays.OrganiseAndPersist
                        and the RowTemplate.GetTemplateRows actions to complete*/
                        if (!readonly) {
                            ctx.dispatch(new TemplateRow.GetTemplateRows(assayFiles));
                        } else {
                            this.templatesLoadedSubject.next('readonly');
                        }
                    })
                }
            )
        } else {
            this.files$.pipe(take(1)).subscribe(
                (files) => {
                    // the data type of assay files is different in this block than the one above - some strict typing needed to avoid confusion
                    let assayFiles = files.study.filter(file => file.file.startsWith('a_'));
                    this.readonly$.pipe(take(1)).subscribe((readonly) => {
                        this.readonly = readonly;

                        this.templatesLoadedSubject.pipe(take(1)).subscribe((val) => {
                            assayFiles.forEach((sheet) => {
                                ctx.dispatch(new Assay.OrganiseAndPersist(sheet.file));
                            });
                        });

                        if (!readonly) {
                            let filenames = [];
                            assayFiles.forEach((assayFile) => {
                                filenames.push(assayFile.file)
                            })
                            ctx.dispatch(new TemplateRow.GetTemplateRows(assayFiles));
                        } else {
                            this.templatesLoadedSubject.next('readonly');
                        }
                    });
                }
            );
        }
    }

    @Action(Assay.Add)
    AddNewAssay(ctx: StateContext<AssayStateModel>, action: Assay.Add) {
        this.readonly$.subscribe(
            (readonly) => {
                this.assaysService.addAssay(action.assay).subscribe(
                    (response) => {
                        this.store.dispatch(new Operations.GetFreshFilesList(false, readonly, action.id));
                        this.store.dispatch(new Protocols.Get());
                    },
                    (error) => {
                        console.log("Unable to add new assay to study.")
                        console.log(error)
                    }
                );
            }
        )
    }

    @Action(Assay.OrganiseAndPersist)
    OrganiseAndPersist(ctx: StateContext<AssayStateModel>, action: Assay.OrganiseAndPersist) {
        this.assaysService.getAssaySheet(action.assaySheetFilename).pipe(take(1)).subscribe(
            (data) => {
                let assay = {};
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
                        if (!mafFile.startsWith("i.e. 'm_MTBLS1")) { // if it is a template value
                            mafFiles.push(mafFile);
                        }
                    }
                });
                console.log(`${mafFiles.length}`)
                mafFiles.forEach((f) => {
                    this.store.dispatch(new MAF.Organise(f))
                });
                assay["mafs"] = mafFiles;
                //insert template Row here
                if (!this.readonly) {
                    const state = ctx.getState();
                    const templates = state.templateRows
                    assay = this.prepareTemplateRow(templates, assay)
                }
                ctx.dispatch(new Assay.Set(assay))

            })
    }

    /**
     * Insert a template row in an assay table, should a template row exist for this assay type.
     * @param templateRows - Collection of template rows, from the state 
     * @param assay - The assay object, we modify its data['rows'] attribute to insert the template
     * @returns assay object.
     */
    prepareTemplateRow(templateRows: TemplateRowCollection, assay: any) {
        const templ = this.rowTemplateService.getTemplateByAssayFilename(assay["name"]);
        if (templ === null) return assay
        const attr = stripHyphensAndLowercase(templ);
        if (Object.keys(templateRows[attr]).length !== 0) {
            if (assay["data"]["rows"][0].index !== -1) {
                assay["data"]["rows"].unshift(templateRows[attr]);
            }
        } else {
            console.warn(`Template row not found for ${attr}`)
        }
        return assay;
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

    @Action(Assay.Delete)
    DeleteStudyAssay(ctx: StateContext<AssayStateModel>, action: Assay.Delete) {
        const state = ctx.getState();
        this.assaysService.deleteAssay(action.assay).subscribe(
            (deleted) => {
                ctx.dispatch(new AssayList.Get(action.id))
            }
        )
    }

    @Action(Assay.AddColumn)
    AddColumnsToAssaySheet(ctx: StateContext<AssayStateModel>, action: Assay.AddColumn) {
        const state = ctx.getState();
        this.assaysService.addColumnToAssaySheet(action.assay, action.body, action.id).subscribe(
            (response) => {
                ctx.dispatch(new Assay.OrganiseAndPersist(action.assay));
            },
            (error) => {
                console.log("Unable to add column to assay sheet.")
                console.log(error)
            }
        );
    }

    @Action(Assay.AddRows)
    AddRows(ctx: StateContext<AssayStateModel>, action: Assay.AddRows) {
        this.assaysService.addRows(action.filename, action.body).subscribe(
            (response) => {
                ctx.dispatch(new Assay.OrganiseAndPersist(action.filename));
            },
            (error) => {
                console.log("Unable to add rows to assay sheet")
                console.log(error)
            }
        )
    }

    @Action(Assay.DeleteRows)
    DeleteRows(ctx: StateContext<AssayStateModel>, action: Assay.DeleteRows) {
        this.assaysService.deleteRows(action.filename, action.rowIds).subscribe(
            (response) => {
                ctx.dispatch(new Assay.OrganiseAndPersist(action.filename));
            },
            (error) => {
                console.log('Unable to delete rows from assay sheet')
                console.log(error)
            }
        )
    }

    @Action(Assay.UpdateCells)
    UpdateCells(ctx: StateContext<AssayStateModel>, action: Assay.UpdateCells) {
        this.assaysService.updateCells(action.filename, action.cellsToUpdate).subscribe(
            (response) => {
                // do some commitCellsToNgxs Processing
                // or
                ctx.dispatch(new Assay.OrganiseAndPersist(action.filename));
            },
            (error) => {
                console.log('Unable to update cells in assay sheet.')
                console.log(error)
            }
        )
    }

    @Action(AssayList.Set)
    SetAssayList(ctx: StateContext<AssayStateModel>, action: AssayList.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            assayList: action.assays
        });
    }

    @Action(TemplateRow.GetTemplateRows)
    GetTemplateRows(ctx: StateContext<AssayStateModel>, action: TemplateRow.GetTemplateRows) {
        const state = ctx.getState();
        const observables = action.assayFiles.map((assayFile) => {
            const templ = this.rowTemplateService.getTemplateByAssayFilename(getFilename(assayFile));
            if (templ === null) return of(null); // return an observable that emits null

            const attr = stripHyphensAndLowercase(templ);

            // If template row already exists, skip (assuming the commented logic is re-enabled)
            if (state.templateRows[attr] && Object.keys(state.templateRows[attr]).length !== 0) {
                return of(null); // return an observable that emits null
            }

            return this.rowTemplateService.getTemplateRow(getFilename(assayFile)).pipe(
                filter((template) => template !== null),
                take(1),
                map((template) => {
                    if (template !== null) {
                        ctx.dispatch(new TemplateRow.SetTemplateRow(template, attr));
                    }
                    return template;
                })
            );
        });

        // Wait for all observables to complete before proceeding
        forkJoin(observables).subscribe(() => {
            this.templatesLoadedSubject.next('ready');
        });
    }


    @Action(TemplateRow.SetTemplateRow)
    SetTemplateRow(ctx: StateContext<AssayStateModel>, action: TemplateRow.SetTemplateRow) {
        const state = ctx.getState();
        let newTemplateRows = null;
        newTemplateRows = state.templateRows;
        if (newTemplateRows === null) newTemplateRows = {}
        newTemplateRows[action.attr] = action.templateRow

        ctx.setState({
            ...state,
            templateRows: newTemplateRows
        });
    }

    @Selector()
    static assayList(state: AssayStateModel): IAssay[] {
        return state.assayList
    }

    @Selector()
    static assays(state: AssayStateModel): Record<string, any> {
        return state.assays
    }

}

function stripHyphensAndLowercase(input: string): string {
    return input.replace(/-/g, '').toLowerCase();
}


function isStudyFile(file: IAssay | StudyFile): file is StudyFile {
    return 'file' in file;
}

function getFilename(file: IAssay | StudyFile) {
    if (isStudyFile(file)) {
        return file.file;
    } else {
        return file.filename
    }
}
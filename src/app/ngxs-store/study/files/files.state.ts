import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { IStudyFiles, StudyFile } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { FilesLists, ObfuscationCode, Operations, ResetFilesState, UploadLocation } from "./files.actions";
import { FilesService } from "src/app/services/decomposed/files.service";
import { Samples } from "../samples/samples.actions";
import { AssayList } from "../assay/assay.actions";
import { filter, take } from "rxjs";
import { ValidationState } from "../validation/validation.state";
import { SetValidationRunNeeded } from "../validation/validation.actions";

export interface FilesStateModel {
    obfuscationCode: string,
    uploadLocation: string,
    files: IStudyFiles,
    selectedFiles: IStudyFiles,
    rawFiles: StudyFile[]
}

const defaultState: FilesStateModel = {
    obfuscationCode: null,
    uploadLocation: null,
    files: null,
    selectedFiles: null,
    rawFiles: null
}

@State<FilesStateModel>({
    name: 'files',
    defaults: defaultState
})
@Injectable()
export class FilesState {

    constructor(private filesService: FilesService, private store: Store) {
    }

    @Action(Operations.GetFreshFilesList)
    GetStudyFiles(ctx: StateContext<FilesStateModel>, action: Operations.GetFreshFilesList) {
        const state = ctx.getState();
        this.filesService.getStudyFilesFetch(action.force, action.readonly, action.id).pipe(take(1)).subscribe({
            next: (data) => {
                ctx.dispatch(new UploadLocation.Set(data.uploadPath));
                ctx.dispatch(new ObfuscationCode.Set(data.obfuscationCode));
                data = this.filesService.deleteProperties(data);
                ctx.dispatch(new FilesLists.SetStudyFiles(data));

                // this could miss some cases where validation report has not yet loaded
                const valTimeSub = this.store.selectOnce(ValidationState.lastValidationRunTime).pipe(filter(val => val !== null));
                valTimeSub.subscribe((valTimestamp) => {
                    const convertedValTimestamp = convertToTimestamp(valTimestamp);
                    console.dir(data);
                    const metadataFiles = data.study.filter(file =>  /^(i_|m_|a_|s_)/.test(file.file))
                    const update = metadataFiles.some(item => isMoreRecentTimestamp(item.timestamp, convertedValTimestamp))

                    if (update) this.store.dispatch(new SetValidationRunNeeded(true));
                });
                // todo: LOAD STUDY SAMPLES
                this.store.dispatch(new Samples.Get(action.id));
                // todo: LOAD STUDY ASSAYS\
                this.store.dispatch(new AssayList.Get(action.id))
            },
            error: (error) => {
                ctx.dispatch(new Operations.GetFilesTree(null, null, null, null, null))
            }
        });

    }

    @Action(Operations.GetFilesTree)
    GetFilesTree(ctx: StateContext<FilesStateModel>, action: Operations.GetFilesTree) {
        const state = ctx.getState();
        this.filesService.getStudyFilesListFromLocation(action.id, action.includeSubDir, action.dir, action.parent, action.location).subscribe(
            (data) => {
                ctx.dispatch(new UploadLocation.Set(data.uploadPath));
                ctx.dispatch(new ObfuscationCode.Set(data.obfuscationCode));
                data = this.filesService.deleteProperties(data);
                ctx.dispatch(new FilesLists.SetStudyFiles(data));
            }
        )
    }


    @Action(UploadLocation.Set)
    SetUploadLocation(ctx: StateContext<FilesStateModel>, action: UploadLocation.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            uploadLocation: action.loc
        })
    }

    @Action(ObfuscationCode.Set)
    SetObfuscationCode(ctx: StateContext<FilesStateModel>, action: ObfuscationCode.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            obfuscationCode: action.obf
        })
    }

    @Action(FilesLists.SetStudyFiles)
    SetStudyFiles(ctx: StateContext<FilesStateModel>, action: FilesLists.SetStudyFiles) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            files: action.files
        })
    }

    @Action(FilesLists.GetRawFiles)
    GetRawFiles(ctx: StateContext<FilesStateModel>, action: FilesLists.GetRawFiles) {
        const state = ctx.getState();
        const rfe = rawFilesDirExists(state.files)
        if (!rfe) {
            return
        }
        const rawFilesObj = {
            file: "FILES/RAW_FILES/",
            createdAt: "",
            timestamp: "",
            type: "",
            status: "",
            directory: true
        }
        this.filesService.getStudyFilesListFromLocation(action.studyId, true, rawFilesObj, null, "study").subscribe({
            next: (files) => {
                console.debug('expected result');
                ctx.dispatch(new FilesLists.SetRawFiles(files.study))
            },
            error: () => { }

        })
    }

    @Action(FilesLists.SetRawFiles)
    SetRawFiles(ctx: StateContext<FilesStateModel>, action: FilesLists.SetRawFiles) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            rawFiles: action.files
        });
    }

    @Action(ResetFilesState)
    Reset(ctx: StateContext<FilesStateModel>, action: ResetFilesState) {
        ctx.setState(defaultState);
    }


    @Selector()
    static getSampleSheet(state: FilesStateModel) {
        let result = state.files.study.find(file => file.file.startsWith('s_'));
        return result
    }

    @Selector()
    static getAssaySheets(state: FilesStateModel) {
        let result = state.files.study.filter(file => file.type === 'metadata_assay' || file.file.startsWith('a_'));
        return result
    }

    @Selector()
    static obfuscationCode(state: FilesStateModel) {
        return state.obfuscationCode;
    }

    @Selector()
    static uploadLocation(state: FilesStateModel) {
        return state.uploadLocation;
    }

    @Selector()
    static files(state: FilesStateModel) {
        return state.files;
    }

    @Selector()
    static rawFiles(state: FilesStateModel) {
        return state.rawFiles
    }


}

function rawFilesDirExists(files: IStudyFiles): boolean {
    let exists = null;
    const dirs = files.study.filter(obj => obj.directory === true)
    const rawFilesObj = dirs.find(dir => dir.file === 'RAW_FILES');
    rawFilesObj === undefined ? exists = false : exists = true;
    return exists
}

function isMoreRecentTimestamp(comparator: string, subject: string): boolean {
    if (comparator.length !== 14 || subject.length !== 14) {
        throw new Error("Invalid timestamp format. Expected format is 'YYYYMMDDHHmmss'.");
    }
    return comparator > subject; 
};

function convertToTimestamp(isoDateString: string): string {
    // Parse the ISO8601 string into a Date object
    const date = new Date(isoDateString);

    // Ensure the date is valid
    if (isNaN(date.getTime())) {
        throw new Error("Invalid ISO8601 date string.");
    }

    // Extract the components of the date
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Construct the timestamp in the format YYYYMMDDHHmmss
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
    console.log(timestamp);
    return timestamp;
}

function filterStrings(strings: string[]) {
    return strings.filter((str) => /^(i_|m_|a_|s_)/.test(str));
}
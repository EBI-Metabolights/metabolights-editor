import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { IStudyFiles } from "src/app/models/mtbl/mtbls/interfaces/study-files.interface";
import { FilesLists, ObfuscationCode, Operations, UploadLocation } from "./files.actions";
import { FilesService } from "src/app/services/decomposed/files.service";
import { sample } from "rxjs-compat/operator/sample";
import { Samples } from "../samples/samples.actions";
import { Assay, AssayList } from "../assay/assay.actions";

export interface FilesStateModel {
    obfuscationCode: string,
    uploadLocation: string,
    files: IStudyFiles,
    selectedFiles: IStudyFiles[];
}

@State<FilesStateModel>({
    name: 'files',
    defaults: {
        obfuscationCode: null,
        uploadLocation: null,
        files: null,
        selectedFiles: null
    }
})
@Injectable()
export class FilesState {

    constructor(private filesService: FilesService, private store: Store) {
    }

    @Action(Operations.GetFreshFilesList)
    GetStudyFiles(ctx: StateContext<FilesStateModel>, action: Operations.GetFreshFilesList) {
        const state = ctx.getState();
        this.filesService.getStudyFilesFetch(action.force, action.readonly).subscribe(
            (data) => {
                ctx.dispatch(new UploadLocation.Set(data.uploadPath));
                ctx.dispatch(new ObfuscationCode.Set(data.obfuscationCode));
                data = this.filesService.deleteProperties(data);
                ctx.dispatch(new FilesLists.SetStudyFiles(data))
                // todo: LOAD STUDY SAMPLES
                this.store.dispatch(new Samples.Get());
                // todo: LOAD STUDY ASSAYS\
                this.store.dispatch(new AssayList.Get(action.id))
            },
            (error) => {
                ctx.dispatch(new Operations.GetFilesTree(null, null, null, null, null))
            }
        );
        
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
}
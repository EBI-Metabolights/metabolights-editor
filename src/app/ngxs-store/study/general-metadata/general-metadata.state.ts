import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person";
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication";
import { GetGeneralMetadata, Identifier, People, Publications, SetStudyReleaseDate, SetStudyReviewerLink, SetStudyStatus, SetStudySubmissionDate, StudyAbstract, Title } from "./general-metadata.actions";
import { Injectable } from "@angular/core";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { SetReadonly, SetStudyError } from "../../non-study/application/application.actions";
import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface";
import { AssayList } from "../assay/assay.actions";
import { Protocols } from "../protocols/protocols.actions"
import { Descriptors } from "../descriptors/descriptors.action";
import { Operations } from "../files/files.actions";
import { EditorValidationRules, ValidationReport } from "../validation/validation.actions";


export interface GeneralMetadataStateModel {
    id: string;
    title: string;
    description: string; // analogous to abstract
    submissionDate: Date;
    releaseDate: Date;
    status: string;
    reviewerLink: any;
    publications: IPublication[];
    people: IPerson[];
}

@State<GeneralMetadataStateModel>({
    name: 'general',
    defaults: {
        id: null,
        title: null,
        description: null,
        submissionDate: null,
        releaseDate: null,
        status: null,
        reviewerLink: null,
        publications: null,
        people: null

    }
})
@Injectable()
export class GeneralMetadataState {
    constructor(
        private generalMetadataService: GeneralMetadataService,
        private store: Store
        ) {
    }

    @Action(GetGeneralMetadata)
    GetStudyGeneralMetadata(ctx: StateContext<GeneralMetadataStateModel>, action: GetGeneralMetadata) {
        this.generalMetadataService.getStudyGeneralMetadata(action.studyId).subscribe(
            (gm_response) => {
                this.store.dispatch(new SetStudyError(false));
                this.store.dispatch(new SetLoadingInfo("Loading investigation details"));
                this.store.dispatch(new SetReadonly(action.readonly));
                this.store.dispatch(new AssayList.Set(gm_response.isaInvestigation.studies[0].assays));
                this.store.dispatch(new Protocols.Set(gm_response.isaInvestigation.studies[0].protocols));
                this.store.dispatch(new Descriptors.Set(gm_response.isaInvestigation.studies[0].studyDesignDescriptors));
                //this.store.dispatch(new SetConfiguration());
                this.store.dispatch(EditorValidationRules.Get);

                ctx.dispatch(new Title.Set(gm_response.isaInvestigation.studies[0].title));
                ctx.dispatch(new StudyAbstract.Set(gm_response.isaInvestigation.studies[0].description));
                ctx.dispatch(new SetStudySubmissionDate(new Date(gm_response.isaInvestigation.submissionDate)));
                ctx.dispatch(new SetStudyReleaseDate(new Date(gm_response.isaInvestigation.publicReleaseDate)));
                ctx.dispatch(new SetStudyStatus(gm_response.mtblsStudy.studyStatus));
                ctx.dispatch(new SetStudyReviewerLink(gm_response.mtblsStudy.reviewerLink));
                ctx.dispatch(new Publications.Set(gm_response.isaInvestigation.studies[0].publications));
                ctx.dispatch(new People.Set(gm_response.isaInvestigation.studies[0].people ));
                
                this.store.dispatch(new Operations.GetFreshFilesList(false, action.readonly));

                if (action.readonly) {
                    this.store.dispatch(new SetReadonly(true));
                    this.store.dispatch(new Loading.Disable());
                } else {
                    this.store.dispatch(new ValidationReport.Get());
                    this.store.dispatch(new SetReadonly(false));
                }
            }, 
            (error) => {
                this.store.dispatch(new SetStudyError(false));
                this.store.dispatch(new Loading.Disable());
                this.store.dispatch(new Operations.GetFreshFilesList(false, action.readonly));
                if (!action.readonly) {
                    this.store.dispatch(new ValidationReport.Get())
                } 


            })
    }

    @Action(Identifier.Set)
    SetStudyIdentifier(ctx: StateContext<GeneralMetadataStateModel>, action: Identifier.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            id: action.id
        })
    }

    @Action(Title.Set)
    SetTitle(ctx: StateContext<GeneralMetadataStateModel>, action: Title.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            title: action.title
        });
    }

    @Action(Title.Update)
    UpdateTitle(ctx: StateContext<GeneralMetadataStateModel>, action: Title.Update) {
        const state = ctx.getState();
        this.generalMetadataService.updateTitle({title: action.title}, state.id).subscribe(
            (res) => {
                ctx.dispatch(new Title.Set(res.title));
            }
        )
    }

    @Action(StudyAbstract.Set)
    SetAbstract(ctx: StateContext<GeneralMetadataStateModel>, action: StudyAbstract.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            description: action.abstract
        });
    }

    @Action(StudyAbstract.Update)
    UpdateAbstract(ctx: StateContext<GeneralMetadataStateModel>, action: StudyAbstract.Update) {
        const state = ctx.getState();
        this.generalMetadataService.updateAbstract({description: action.description}, state.id).subscribe(
            (response) => {
                ctx.dispatch(new StudyAbstract.Set(response.description));
            },
            (error) => {
                console.error('Error in updating the study description.')
            }
        )
    }

    @Action(SetStudySubmissionDate)
    SetSubmissionDate(ctx: StateContext<GeneralMetadataStateModel>, action: SetStudySubmissionDate) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            submissionDate: action.date
        });
    }

    @Action(SetStudyReleaseDate)
    SetReleaseDate(ctx: StateContext<GeneralMetadataStateModel>, action: SetStudyReleaseDate) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            releaseDate: action.date
        });
    }

    @Action(SetStudyStatus)
    SetStatus(ctx: StateContext<GeneralMetadataStateModel>, action: SetStudyStatus) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            status: action.status
        });
    }

    @Action(SetStudyReviewerLink)
    SetReviewerLink(ctx: StateContext<GeneralMetadataStateModel>, action: SetStudyReviewerLink) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            reviewerLink: action.link
        });
    }

    @Action(Publications.Set)
    SetPublications(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            publications: action.publications
        });
    }

    @Action(People.Set)
    SetPeople(ctx: StateContext<GeneralMetadataStateModel>, action: People.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            people: action.people
        });
    }




    @Selector()
    static id(state: GeneralMetadataStateModel): string {
        return state.id
    }

    @Selector()
    static title(state: GeneralMetadataStateModel): string {
        return state.title
    }

    @Selector()
    static description(state: GeneralMetadataStateModel): string {
        return state.description
    }

    @Selector()
    static releaseDate(state: GeneralMetadataStateModel): Date {
        return state.releaseDate
    }

    @Selector()
    static status(state: GeneralMetadataStateModel): string {
        return state.status
    }

    @Selector()
    static reviewerLink(state: GeneralMetadataStateModel): string {
        return state.reviewerLink
    }

    @Selector()
    static publications(state: GeneralMetadataStateModel): IPublication[] {
        return state.publications
    }

    @Selector()
    static people(state: GeneralMetadataStateModel): IPerson[] {
        return state.people
    }
}
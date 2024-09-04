import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person";
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication";
import {  CurationRequest, GetGeneralMetadata, Identifier, People, Publications, SetStudyReviewerLink, SetStudySubmissionDate, StudyAbstract, StudyReleaseDate, StudyStatus, Title } from "./general-metadata.actions";
import { Injectable } from "@angular/core";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { SetReadonly, SetStudyError } from "../../non-study/application/application.actions";
import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface";
import { AssayList } from "../assay/assay.actions";
import { Protocols } from "../protocols/protocols.actions"
import { Descriptors, Factors } from "../descriptors/descriptors.action";
import { Operations } from "../files/files.actions";
import { EditorValidationRules, NewValidationReport, ValidationReport } from "../validation/validation.actions";
import { JsonConvert } from "json2typescript";


export interface GeneralMetadataStateModel {
    id: string;
    title: string;
    description: string; // analogous to abstract
    submissionDate: Date;
    releaseDate: Date;
    status: string;
    curationRequest: string;
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
        curationRequest: null,
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
                this.store.dispatch(new Factors.Set(gm_response.isaInvestigation.studies[0].factors))
                //this.store.dispatch(new SetConfiguration());
                this.store.dispatch(new EditorValidationRules.Get());

                // TODO fix, commenting this out for demo purpose
                //this.store.dispatch(new NewValidationReport.Get());

                ctx.dispatch(new Title.Set(gm_response.isaInvestigation.studies[0].title));
                ctx.dispatch(new StudyAbstract.Set(gm_response.isaInvestigation.studies[0].description));
                ctx.dispatch(new SetStudySubmissionDate(new Date(gm_response.isaInvestigation.submissionDate)));
                ctx.dispatch(new StudyReleaseDate.Set(new Date(gm_response.isaInvestigation.publicReleaseDate)));
                ctx.dispatch(new StudyStatus.Set(gm_response.mtblsStudy.studyStatus));
                ctx.dispatch(new CurationRequest.Set(gm_response.mtblsStudy.curationRequest));
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
        this.generalMetadataService.updateTitle(action.title, state.id).subscribe(
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

    @Action(StudyReleaseDate.Set)
    SetReleaseDate(ctx: StateContext<GeneralMetadataStateModel>, action: StudyReleaseDate.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            releaseDate: action.date
        });
    }

    @Action(StudyReleaseDate.Update)
    UpdateReleaseDate(ctx: StateContext<GeneralMetadataStateModel>, action: StudyReleaseDate.Update) {
        const state = ctx.getState();
        this.generalMetadataService.changeReleaseDate(action.date, state.id).subscribe(
            (response) => {
                ctx.dispatch(new StudyReleaseDate.Set(new Date(response.releaseDate)));
            })
    }

    @Action(StudyStatus.Set)
    SetStatus(ctx: StateContext<GeneralMetadataStateModel>, action: StudyStatus.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            status: action.status
        });
    }

    @Action(CurationRequest.Set)
    SetCurationRequest(ctx: StateContext<GeneralMetadataStateModel>, action: CurationRequest.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            curationRequest: action.curationRequest
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

    @Action(Publications.Get)
    GetPublications(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Get) {
        const state = ctx.getState();
        this.generalMetadataService.getPublications(state.id).subscribe(
            (response) => {
                ctx.dispatch(new Publications.Set(response.publications as IPublication[]));
            }
        )
    }

    @Action(Publications.Add)
    AddPublication(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Add) {
        const state = ctx.getState();
        this.generalMetadataService.savePublication(action.publication, state.id).subscribe(
            (response) => {
                ctx.dispatch(new Publications.Set([response], true))
            }
        )

    }

    @Action(Publications.Update)
    UpdatePublication(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Update) {
        const state = ctx.getState();
        this.generalMetadataService.updatePublication(action.title, action.publication, state.id).subscribe(
        (response) => {
            console.log(action.title);
            ctx.dispatch(new Publications.Set([response], false, true, action.title))
            }
        )

    }

    @Action(Publications.Delete)
    DeletePublication(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Delete) {
        const state = ctx.getState();
        this.generalMetadataService.deletePublication(action.title, state.id).subscribe(
            (response) => {
                    ctx.dispatch(new Publications.Get());
                },
            (error) => {
                console.log(`Unable to delete publication ${action.title}`);
                console.error(error);
            }
            )
    }

    @Action(Publications.Set)
    SetPublications(ctx: StateContext<GeneralMetadataStateModel>, action: Publications.Set) {
        const state = ctx.getState();
        const jsonConvert: JsonConvert = new JsonConvert();
        let temp = [];
        action.publications.forEach((publication) => {
            temp.push(jsonConvert.deserialize(publication, MTBLSPublication));
        });
        if (action.extend) temp = temp.concat(state.publications);
        if (action.update){
            let existingPublications = []
            existingPublications = existingPublications.concat(state.publications);
            existingPublications = existingPublications.filter(pub => pub.title !== action.oldTitle);
            temp = temp.concat(existingPublications);
            temp.sort((a, b) => {
                return a.title[0].localeCompare(b.title[0]);
              });
        }
        ctx.setState({
            ...state,
            publications: temp
        });
    }

    @Action(People.Set)
    SetPeople(ctx: StateContext<GeneralMetadataStateModel>, action: People.Set) {
        const state = ctx.getState();
        const jsonConvert: JsonConvert = new JsonConvert();
        let temp = [];

        action.people.forEach((person) => {
            temp.push(jsonConvert.deserialize(person, MTBLSPerson));
        });
        if (action.extend) temp = temp.concat(state.people);
        ctx.setState({
            ...state,
            people: temp
        });
    }

    @Action(People.Get)
    GetPeople(ctx: StateContext<GeneralMetadataStateModel>, action: People.Get) {
        const state = ctx.getState();
        this.generalMetadataService.getPeople(state.id).subscribe(
            (response) => {
                ctx.dispatch(new People.Set(response.contacts as IPerson[]));
            },
            (error) => {
                console.log("Could not get study people.");
                console.error(error);
            }
        )
    }

    @Action(People.Add)
    AddPerson(ctx: StateContext<GeneralMetadataStateModel>, action: People.Add) {
        const state = ctx.getState();
        this.generalMetadataService.savePerson(action.body, state.id).subscribe(
            (response) => {
                ctx.dispatch(new People.Set(response.contacts as IPerson[], false))
            },
            (error) => {
                console.log("Could not add new study person.");
                console.error(error);
            }
        )
    }

    @Action(People.Update)
    UpdatePerson(ctx: StateContext<GeneralMetadataStateModel>, action: People.Update) {
        const state = ctx.getState();
        let name = `${action.body.contacts[0].firstName}${action.body.contacts[0].lastName}`
        let email = "";
        let duds = [null, undefined, ''];
        duds.includes(action.existingEmail) ? email = action.existingEmail : email = action[0].body.contacts[0].email
        this.generalMetadataService.updatePerson(email, name, action.body, state.id).subscribe(
            (response) => {
                let body = null
                if (!Object.keys(response).includes('contacts')) body = [response]
                else body = response.contacts
                ctx.dispatch(new People.Get());
            },
            (error) => {
                console.log("Could not update study person");
                console.error(error);
            }
        )
    }

    @Action(People.Delete)
    DeletePerson(ctx: StateContext<GeneralMetadataStateModel>, action: People.Delete) {
        const state = ctx.getState();
        this.generalMetadataService.deletePerson(action.email, action.fullName, state.id).subscribe(
            (response) => {
                ctx.dispatch(new People.Get());
            },
            (error) => {
                console.log(`Unable to delete study person ${action.fullName}`);
                console.error(error);
            }
        )
    }

    @Action(People.GrantSubmitter)
    GrantSubmitter(ctx: StateContext<GeneralMetadataStateModel>, action: People.GrantSubmitter) {
        const state = ctx.getState();
        this.generalMetadataService.makePersonSubmitter(action.email, state.id).subscribe(
            (response) => {

            },
            (error) => {
                console.log("Unable to make person submitter");
                console.error(error)
            }
            )
    }

    @Action(StudyStatus.Update)
    ChangeStudyStatus(ctx: StateContext<GeneralMetadataStateModel>, action: StudyStatus.Update) {
        const state = ctx.getState();
        this.generalMetadataService.changeStatus(action.status, state.id).subscribe(
            (response) => {
                ctx.dispatch(new StudyStatus.Set(action.status));
            }
        )
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
    static curationRequest(state: GeneralMetadataStateModel): string {
        return state.curationRequest
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

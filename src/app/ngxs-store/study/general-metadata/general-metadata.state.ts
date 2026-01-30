import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import * as toastr from "toastr";
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person";
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication";
import { CurationRequest, DatasetLicenseNS, GetGeneralMetadata, Identifier, People, Publications, ResetGeneralMetadataState, SetStudyReviewerLink, SetStudySubmissionDate, StudyAbstract, StudyReleaseDate, StudyStatus, Title, RevisionNumber, RevisionDateTime, RevisionStatus, PublicFtpUrl, PublicHttpUrl, PublicGlobusUrl, PublicAsperaPath, RevisionComment, RevisionTaskMessage, FirstPrivateDate, FirstPublicDate, SampleTemplate, StudyCategory, TemplateVersion, StudyCreatedAt, Funders, RelatedDatasets } from "./general-metadata.actions";
import { Injectable } from "@angular/core";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IPublication } from "src/app/models/mtbl/mtbls/interfaces/publication.interface";
import { SetReadonly, SetStudyError } from "../../non-study/application/application.actions";
import { IPerson } from "src/app/models/mtbl/mtbls/interfaces/person.interface";
import { AssayList } from "../assay/assay.actions";
import { Protocols } from "../protocols/protocols.actions"
import { Descriptors, Factors } from "../descriptors/descriptors.action";
import { ObfuscationCode, Operations, UploadLocation } from "../files/files.actions";
import { EditorValidationRules, ValidationReport } from "../validation/validation.actions";
import { JsonConvert } from "json2typescript";
import { take } from "rxjs/operators";
import { User } from "../../non-study/user/user.actions";
import { DatasetLicense, DatasetLicenseService } from "src/app/services/decomposed/dataset-license.service";


export interface GeneralMetadataStateModel {
    id: string;
    title: string;
    description: string; // analogous to abstract
    submissionDate: string;
    releaseDate: string;
    status: string;
    curationRequest: string;
    reviewerLink: any;
    publications: IPublication[];
    people: IPerson[];
    datasetLicense: DatasetLicense;
    revisionNumber: number;
    revisionDatetime: string;
    revisionStatus: number;
    revisionComment: string;
    revisionTaskMessage: string;
    publicHttpUrl: string;
    publicFtpUrl: string;
    publicGlobusUrl: string;
    publicAsperaPath: string;
    firstPrivateDate: string;
    firstPublicDate: string;
    sampleTemplate: string;
    templateVersion: string;
    studyCategory: string;
    studyCreatedAt: string;
    funders: any[];
    relatedDatasets: any[];
    comments: any[];
}
const defaultState: GeneralMetadataStateModel = {
    id: null,
    title: null,
    description: null,
    submissionDate: null,
    releaseDate: null,
    status: null,
    curationRequest: null,
    reviewerLink: null,
    publications: null,
    people: null,
    datasetLicense: null,
    revisionNumber: null,
    revisionDatetime: null,
    revisionStatus: null,
    revisionComment: null,
    revisionTaskMessage: null,
    publicHttpUrl: null,
    publicFtpUrl: null,
    publicGlobusUrl: null,
    publicAsperaPath: null,
    firstPrivateDate: null,
    firstPublicDate: null,
    sampleTemplate: null,
    templateVersion: null,
    studyCategory: null,
    studyCreatedAt: null,
    funders: [],
    relatedDatasets: [],
    comments: []
}

@State<GeneralMetadataStateModel>({
    name: 'general',
    defaults: defaultState
})
@Injectable()
export class GeneralMetadataState {
    constructor(
        private generalMetadataService: GeneralMetadataService,
        private datasetLicenseService: DatasetLicenseService,
        private store: Store
        ) {
    }

    @Action(GetGeneralMetadata)
    GetStudyGeneralMetadata(ctx: StateContext<GeneralMetadataStateModel>, action: GetGeneralMetadata) {
        this.generalMetadataService.getStudyGeneralMetadata(action.studyId).pipe(take(1)).subscribe({
            next: (gm_response) => {
                const state = ctx.getState();
                if (state.id === null) { ctx.dispatch(new Identifier.Set(action.studyId))}
                if (state.id !== action.studyId) ctx.dispatch(new Identifier.Set(action.studyId));
                this.store.dispatch(new SetStudyError(false));
                this.store.dispatch(new SetLoadingInfo("Loading investigation details"));
                this.store.dispatch(new SetReadonly(action.readonly));
                this.store.dispatch(new AssayList.Set(gm_response.isaInvestigation.studies[0].assays));
                this.store.dispatch(new Protocols.Set(gm_response.isaInvestigation.studies[0].protocols));
                this.store.dispatch(new Descriptors.Set(gm_response.isaInvestigation.studies[0].studyDesignDescriptors));
                this.store.dispatch(new Factors.Set(gm_response.isaInvestigation.studies[0].factors))
                //this.store.dispatch(new SetConfiguration());
                this.store.dispatch(new EditorValidationRules.Get());
                // this.store.dispatch(new DatasetLicenseNS.GetDatasetLicense(action.studyId))

                // TODO fix, commenting this out for demo purpose
                //this.store.dispatch(new NewValidationReport.Get());
                ctx.dispatch(new Title.Set(gm_response.isaInvestigation.studies[0].title));
                ctx.dispatch(new StudyAbstract.Set(gm_response.isaInvestigation.studies[0].description));
                ctx.dispatch(new SetStudySubmissionDate(gm_response.isaInvestigation.submissionDate));
                ctx.dispatch(new StudyReleaseDate.Set(gm_response.isaInvestigation.publicReleaseDate));
                ctx.dispatch(new StudyStatus.Set(gm_response.mtblsStudy.studyStatus));
                ctx.dispatch(new CurationRequest.Set(gm_response.mtblsStudy.curationRequest));
                ctx.dispatch(new RevisionNumber.Set(gm_response.mtblsStudy.revisionNumber));
                ctx.dispatch(new RevisionDateTime.Set(gm_response.mtblsStudy.revisionDatetime));

                ctx.dispatch(new RevisionStatus.Set(gm_response.mtblsStudy.revisionStatus));
                ctx.dispatch(new RevisionComment.Set(gm_response.mtblsStudy.revisionComment));
                ctx.dispatch(new RevisionTaskMessage.Set(gm_response.mtblsStudy.revisionTaskMessage));
                ctx.dispatch(new PublicFtpUrl.Set(gm_response.mtblsStudy.studyFtpUrl));
                ctx.dispatch(new PublicHttpUrl.Set(gm_response.mtblsStudy.studyHttpUrl));
                ctx.dispatch(new PublicGlobusUrl.Set(gm_response.mtblsStudy.studyGlobusUrl));
                ctx.dispatch(new PublicAsperaPath.Set(gm_response.mtblsStudy.studyAsperaPath));

                ctx.dispatch(new FirstPrivateDate.Set(gm_response.mtblsStudy.firstPrivateDate));
                ctx.dispatch(new FirstPublicDate.Set(gm_response.mtblsStudy.firstPublicDate));
                ctx.dispatch(new SampleTemplate.Set(gm_response.mtblsStudy.sampleTemplate));
                ctx.dispatch(new StudyCreatedAt.Set(gm_response.mtblsStudy.createdAt));
                ctx.dispatch(new StudyCategory.Set(gm_response.mtblsStudy.studyCategory));
                ctx.dispatch(new TemplateVersion.Set(gm_response.mtblsStudy.templateVersion));
                ctx.dispatch(new DatasetLicenseNS.SetDatasetLicense(
                  {
                    name: gm_response.mtblsStudy.datasetLicense,
                    version: "",
                    agreed: gm_response.mtblsStudy.datasetLicense ? true : false,
                    agreeingUser: "",
                    licenseUrl: gm_response.mtblsStudy.datasetLicenseUrl
                  } ));
                
                ctx.dispatch(new SetStudyReviewerLink(gm_response.mtblsStudy.reviewerLink));
                ctx.dispatch(new Publications.Set(gm_response.isaInvestigation.studies[0].publications));
                ctx.dispatch(new People.Set(gm_response.isaInvestigation.studies[0].people ));
                
                // Parse Funders
                const comments = gm_response.isaInvestigation.studies[0].comments || [];
                ctx.patchState({ comments }); // Store raw comments for later use

                const funderNames = comments.find(c => c.name === 'Funder')?.value.split(';') || [];
                const funderIds = comments.find(c => c.name === 'Funder ROR ID')?.value.split(';') || [];
                const grantIds = comments.find(c => c.name === 'Grant Identifier')?.value.split(';') || [];
                
                const funders = funderNames.map((name, i) => ({
                    fundingOrganization: {
                        annotationValue: name,
                        termAccession: funderIds[i] || ''
                    },
                    grantIdentifier: grantIds[i] || ''
                }));
                ctx.patchState({ funders });

                // Parse Related Datasets
                const relatedAccessions = comments.find(c => c.name === 'Related Data Accession')?.value.split(';') || [];
                const relatedRepos = comments.find(c => c.name === 'Related Data Repository')?.value.split(';') || [];
                
                const relatedDatasets = relatedAccessions.map((acc, i) => ({
                    accession: acc,
                    repository: relatedRepos[i] || ''
                }));
                ctx.patchState({ relatedDatasets });
                

                this.store.dispatch(new Operations.GetFreshFilesList(false, action.readonly, action.studyId));

                if (action.readonly) {
                    this.store.dispatch(new SetReadonly(true));
                    this.store.dispatch(new Loading.Disable());
                } else {
                    this.store.dispatch(new ValidationReport.Get(action.studyId));
                    this.store.dispatch(new SetReadonly(false));
                }
            },
            error: (error) => {
                this.store.dispatch(new SetStudyError(false));
                this.store.dispatch(new Loading.Disable());
                this.store.dispatch(new Operations.GetFreshFilesList(false, action.readonly, action.studyId));
                if (!action.readonly) {
                    this.store.dispatch(new ValidationReport.Get(action.studyId))
                }


            }})
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
                ctx.dispatch(new StudyReleaseDate.Set(response.releaseDate));
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

    @Action(RevisionNumber.Set)
    SetRevisionNumber(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionNumber.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            revisionNumber: action.revisionNumber
        });
    }

    @Action(RevisionDateTime.Set)
    SetRevisionDateTime(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionDateTime.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            revisionDatetime: action.revisionDatetime
        });
    }


    @Action(RevisionStatus.Set)
    SetRevisionStatus(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionStatus.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            revisionStatus: action.revisionStatus
        });
    }

    @Action(RevisionComment.Set)
    SetRevisionComment(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionComment.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            revisionComment: action.revisionComment
        });
    }

    @Action(RevisionTaskMessage.Set)
    SetRevisionTaskMessage(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionTaskMessage.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            revisionTaskMessage: action.revisionTaskMessage
        });
    }

    @Action(PublicFtpUrl.Set)
    SetPublicFtpUrl(ctx: StateContext<GeneralMetadataStateModel>, action: PublicFtpUrl.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            publicFtpUrl: action.publicFtpUrl
      });
    }

    @Action(PublicHttpUrl.Set)
    SetPublicHttpUrl(ctx: StateContext<GeneralMetadataStateModel>, action: PublicHttpUrl.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            publicHttpUrl: action.publicHttpUrl
      });
    }

    @Action(PublicGlobusUrl.Set)
    SetPublicGlobusUrl(ctx: StateContext<GeneralMetadataStateModel>, action: PublicGlobusUrl.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            publicGlobusUrl: action.publicGlobusUrl
      });
    }

    @Action(FirstPrivateDate.Set)
    SetFirstPrivateDate(ctx: StateContext<GeneralMetadataStateModel>, action: FirstPrivateDate.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            firstPrivateDate: action.firstPrivateDate
      });
    }

    @Action(FirstPublicDate.Set)
    SetFirstPublicDate(ctx: StateContext<GeneralMetadataStateModel>, action: FirstPublicDate.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            firstPublicDate: action.firstPublicDate
      });
    }

    @Action(SampleTemplate.Set)
    SetSampleTemplate(ctx: StateContext<GeneralMetadataStateModel>, action: SampleTemplate.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            sampleTemplate: action.sampleTemplate
      });
    }

    @Action(StudyCreatedAt.Set)
    SetStudyCreatedAt(ctx: StateContext<GeneralMetadataStateModel>, action: StudyCreatedAt.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            studyCreatedAt: action.studyCreatedAt
      });
    }

    @Action(StudyCategory.Set)
    SetStudyCategory(ctx: StateContext<GeneralMetadataStateModel>, action: StudyCategory.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            studyCategory: action.studyCategory
      });
    }

    @Action(TemplateVersion.Set)
    SetTemplateVersion(ctx: StateContext<GeneralMetadataStateModel>, action: TemplateVersion.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            templateVersion: action.templateVersion
      });
    }

    @Action(PublicAsperaPath.Set)
    SetPublicAsperaPath(ctx: StateContext<GeneralMetadataStateModel>, action: PublicAsperaPath.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            publicAsperaPath: action.publicAsperaPath
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

        action.people.forEach((person, index) => {
            person.contactIndex = index; // assign contactIndex if not present
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
                ctx.dispatch(new People.Get());
                this.generalMetadataService.emitMessage({
                    type: 'add',
                    status: 'success',
                    message: 'Person added successfully!'
                });
            },
            (error) => {
                console.log("Could not add new study person.");
                const errorsArray: string[] = 
                (error.error?.errors && Array.isArray(error.error.errors))
                    ? error.error.errors
                    : [error.message || 'Could not add new study person'];

                this.generalMetadataService.emitMessage({
                    type: 'add',
                    status: 'error',
                    message: errorsArray.join(', ')
                });  
            }
        )
    }

    @Action(People.Update)
    UpdatePerson(ctx: StateContext<GeneralMetadataStateModel>, action: People.Update) {
        const state = ctx.getState();

        this.generalMetadataService.updatePerson(action.email, action.fullName, action.body, state.id, action.contactIndex).subscribe(
            (response) => {
                let body = null
                if (!Object.keys(response).includes('contacts')) body = [response]
                else body = response.contacts
                ctx.dispatch(new People.Get());

                this.generalMetadataService.emitMessage({
                    type: 'update',
                    status: 'success',
                    message: 'Person updated successfully!'
                });
            },
            (error) => {
                console.log("Could not update study person");
                
                const errorsArray: string[] = 
                (error.error?.errors && Array.isArray(error.error.errors))
                    ? error.error.errors
                    : [error.message || 'Could not update study person'];

                this.generalMetadataService.emitMessage({
                    type: 'update',
                    status: 'error',
                    message: errorsArray.join(', ')
                });  
                
            }
        )
    }

    @Action(People.Delete)
    DeletePerson(ctx: StateContext<GeneralMetadataStateModel>, action: People.Delete) {
        const state = ctx.getState();
        this.generalMetadataService.deletePerson(action.email, action.fullName, state.id, action.contactIndex).subscribe(
            (response) => {
                ctx.dispatch(new People.Get());
                this.generalMetadataService.emitMessage({
                    type: 'delete',
                    status: 'success',
                    message: 'Person deleted successfully!'
                });
            },
            (error) => {
                console.log(`Unable to delete study person ${action.fullName}`);
                const errorsArray: string[] = 
                (error.error?.errors && Array.isArray(error.error.errors))
                    ? error.error.errors
                    : [error.message || `Unable to delete study person ${action.fullName}`];

                this.generalMetadataService.emitMessage({
                    type: 'delete',
                    status: 'error',
                    message: errorsArray.join(', ')
                });  
            }
        )
    }

    @Action(People.GrantSubmitter)
    GrantSubmitter(ctx: StateContext<GeneralMetadataStateModel>, action: People.GrantSubmitter) {
        const state = ctx.getState();
        this.generalMetadataService.makePersonSubmitter(action.email, state.id).subscribe(
            (response) => {
               this.generalMetadataService.emitMessage({
                    type: 'makesubmitter',
                    status: 'success',
                    message: 'Person deleted successfully!'
                }); 
            },
            (error) => {
                console.log("Unable to make person submitter");
                const errorsArray: string[] = 
                (error.error?.errors && Array.isArray(error.error.errors))
                    ? error.error.errors
                    : [error.message || 'Unable to make person submitter'];

                this.generalMetadataService.emitMessage({
                    type: 'makesubmitter',
                    status: 'error',
                    message: errorsArray.join(', ')
                });  
            }
            )
    }


    @Action(RevisionNumber.New)
    NewStudyRevision(ctx: StateContext<GeneralMetadataStateModel>, action: RevisionNumber.New) {
        const state = ctx.getState();
        this.generalMetadataService.createRevision(state.id, action.revisionComment).subscribe(
            (response) => {
                const state = ctx.getState();

                if (response.hasOwnProperty("revision_number")){
                  const revisionNumber = response["revision_number"]
                  if (state.revisionNumber !== revisionNumber) {
                    ctx.dispatch(new RevisionNumber.Set(revisionNumber));
                  }
                }
                if (response.hasOwnProperty("status")){
                    ctx.dispatch(new RevisionStatus.Set(response["status"]));
                }
                if (response.hasOwnProperty("revision_datetime")){
                  const revisionDatetime = response["revision_datetime"]
                  if (state.revisionDatetime !== revisionDatetime) {
                    ctx.dispatch(new RevisionDateTime.Set(revisionDatetime));
                  }
                }
            }
        )
    }

    @Action(StudyStatus.Update)
    ChangeStudyStatus(ctx: StateContext<GeneralMetadataStateModel>, action: StudyStatus.Update) {
        const state = ctx.getState();
        this.generalMetadataService.changeStatus(action.status, state.id).pipe(take(1)).subscribe(
            (response) => {
                const state = ctx.getState();
                let updated_study_id = state.id;
                if (response.hasOwnProperty("assigned_study_id")){
                  updated_study_id = response["assigned_study_id"]
                  if (state.id !== updated_study_id) {
                    ctx.dispatch(new Identifier.Set(updated_study_id));
                  }
                }
                let assigned_status = action.status;
                if (response.hasOwnProperty("assigned_status")){
                  assigned_status = response["assigned_status"]
                }
                if (assigned_status !== state.status) {
                  ctx.dispatch(new StudyStatus.Set(assigned_status));
                }
                if (response.hasOwnProperty("ftp_folder_path")){
                  const ftpFolderPath = response["ftp_folder_path"]
                  ctx.dispatch(new UploadLocation.Set(ftpFolderPath));
                }
                if (response.hasOwnProperty("obfuscation_code")){
                  const obfuscationCode = response["obfuscation_code"]
                  ctx.dispatch(new ObfuscationCode.Set(obfuscationCode));
                }
                const readOnlySub = this.store.select(state => state.ApplicationState && state.ApplicationState.readonly).pipe(take(1))
                readOnlySub.subscribe((ro) => {
                    this.store.dispatch(new User.Studies.Get())
                    ctx.dispatch(new GetGeneralMetadata(updated_study_id, ro));
                })

            }
        )
    }

    @Action(DatasetLicenseNS.ConfirmAgreement)
    ConfirmAgreement({dispatch}: StateContext<GeneralMetadataStateModel>, {studyId}: DatasetLicenseNS.ConfirmAgreement) {
        this.datasetLicenseService.confirmLicenseAgreement(studyId).subscribe({
            next: (licenseResponse) => {
                dispatch(new DatasetLicenseNS.SetDatasetLicense(licenseResponse.content.dataset))
            },
            error: (error) => {console.error(`Unable to confirm license agreement: ${error}`)}

        })
    }

    @Action(DatasetLicenseNS.SetDatasetLicense)
    SetDatasetLicense( {patchState}: StateContext<GeneralMetadataStateModel>, {license}: DatasetLicenseNS.SetDatasetLicense) {
        patchState({
            datasetLicense: license
        });
    }

    @Action(DatasetLicenseNS.GetDatasetLicense)
    GetDatasetLicense( {dispatch}: StateContext<GeneralMetadataStateModel>, {studyId}: DatasetLicenseNS.GetDatasetLicense) {
        this.datasetLicenseService.getLicenseAgreement(studyId).subscribe({
            next: (licenseResponse) => {
                let dataset = null;
                licenseResponse.content.dataset == null ? dataset = {name: "", version: "", agreed: false, agreeingUser: "", licenseUrl: ""} : dataset = licenseResponse.content.dataset;
                dispatch(new DatasetLicenseNS.SetDatasetLicense(dataset));
            },
            error: (error) => {console.error(`Unable to retrieve dataset license: ${error}`);}
        })
    }


    @Action(ResetGeneralMetadataState)
    Reset(ctx: StateContext<GeneralMetadataStateModel>, action: ResetGeneralMetadataState) {
        ctx.setState(defaultState);
    }


    @Selector()
    static id(state: GeneralMetadataStateModel): string {
        return state?.id
    }

    @Selector()
    static title(state: GeneralMetadataStateModel): string {
        return state?.title
    }

    @Selector()
    static description(state: GeneralMetadataStateModel): string {
        return state?.description
    }

    @Selector()
    static releaseDate(state: GeneralMetadataStateModel): string {
        return state?.releaseDate
    }

    @Selector()
    static status(state: GeneralMetadataStateModel): string {
        return state?.status
    }

    @Selector()
    static curationRequest(state: GeneralMetadataStateModel): string {
        return state?.curationRequest
    }
    @Selector()
    static revisionNumber(state: GeneralMetadataStateModel): number {
        return state?.revisionNumber
    }

    @Selector()
    static revisionDatetime(state: GeneralMetadataStateModel): string {
        return state?.revisionDatetime
    }

    @Selector()
    static revisionStatus(state: GeneralMetadataStateModel): number {
        return state?.revisionStatus
    }

    @Selector()
    static revisionComment(state: GeneralMetadataStateModel): string {
        return state?.revisionComment
    }
    @Selector()
    static revisionTaskMessage(state: GeneralMetadataStateModel): string {
        return state?.revisionTaskMessage
    }
    @Selector()
    static reviewerLink(state: GeneralMetadataStateModel): string {
        return state?.reviewerLink
    }

    @Selector()
    static publications(state: GeneralMetadataStateModel): IPublication[] {
        return state?.publications
    }

    @Selector()
    static people(state: GeneralMetadataStateModel): IPerson[] {
        return state?.people
    }

    @Selector()
    static datasetLicense(state: GeneralMetadataStateModel): DatasetLicense {
        return state?.datasetLicense
    }

    @Selector()
    static publicHttpUrl(state: GeneralMetadataStateModel): string {
        return state?.publicHttpUrl
    }
    @Selector()
    static publicFtpUrl(state: GeneralMetadataStateModel): string {
        return state?.publicFtpUrl
    }
    @Selector()
    static publicGlobusUrl(state: GeneralMetadataStateModel): string {
        return state?.publicGlobusUrl
    }
    @Selector()
    static publicAsperaPath(state: GeneralMetadataStateModel): string {
        return state?.publicAsperaPath
    }
    @Selector()
    static firstPrivateDate(state: GeneralMetadataStateModel): string {
        return state?.firstPrivateDate
    }
    @Selector()
    static firstPublicDate(state: GeneralMetadataStateModel): string {
        return state?.firstPublicDate
    }
    @Selector()
    static sampleTemplate(state: GeneralMetadataStateModel): string {
        return state?.sampleTemplate
    }
    @Selector()
    static templateVersion(state: GeneralMetadataStateModel): string {
        return state?.templateVersion
    }
    @Selector()
    static studyCategory(state: GeneralMetadataStateModel): string {
        return state?.studyCategory
    }
    @Selector()
    static studyCreatedAt(state: GeneralMetadataStateModel): string {
        return state?.studyCreatedAt
    }
    
    @Action(Funders.Get)
    GetFunders(ctx: StateContext<GeneralMetadataStateModel>, action: Funders.Get) {
        // Already handled by GetStudyGeneralMetadata as it parses from comments
        // If we needed to re-fetch, we would call GetStudyGeneralMetadata
    }

    @Action(Funders.Add)
    AddFunder(ctx: StateContext<GeneralMetadataStateModel>, action: Funders.Add) {
        const state = ctx.getState();
        const currentFunders = state.funders || [];
        const newFunders = [...currentFunders, action.body];
        
        ctx.patchState({ funders: newFunders });
        this.saveFundersToComments(ctx, newFunders);
    }

    @Action(Funders.Update)
    UpdateFunder(ctx: StateContext<GeneralMetadataStateModel>, action: Funders.Update) {
        const state = ctx.getState();
        const currentFunders = [...(state.funders || [])];
        if (action.index >= 0 && action.index < currentFunders.length) {
            currentFunders[action.index] = action.body;
            ctx.patchState({ funders: currentFunders });
            this.saveFundersToComments(ctx, currentFunders);
        }
    }

    @Action(Funders.Delete)
    DeleteFunder(ctx: StateContext<GeneralMetadataStateModel>, action: Funders.Delete) {
        const state = ctx.getState();
        const currentFunders = [...(state.funders || [])];
        if (action.index >= 0 && action.index < currentFunders.length) {
            currentFunders.splice(action.index, 1);
            ctx.patchState({ funders: currentFunders });
            this.saveFundersToComments(ctx, currentFunders);
        }
    }

    @Action(RelatedDatasets.Add)
    AddRelatedDataset(ctx: StateContext<GeneralMetadataStateModel>, action: RelatedDatasets.Add) {
        const state = ctx.getState();
        const currentDatasets = state.relatedDatasets || [];
        const newDatasets = [...currentDatasets, action.body];
        
        ctx.patchState({ relatedDatasets: newDatasets });
        this.saveRelatedDatasetsToComments(ctx, newDatasets);
    }

    @Action(RelatedDatasets.Update)
    UpdateRelatedDataset(ctx: StateContext<GeneralMetadataStateModel>, action: RelatedDatasets.Update) {
        const state = ctx.getState();
        const currentDatasets = [...(state.relatedDatasets || [])];
        if (action.index >= 0 && action.index < currentDatasets.length) {
            currentDatasets[action.index] = action.body;
            ctx.patchState({ relatedDatasets: currentDatasets });
            this.saveRelatedDatasetsToComments(ctx, currentDatasets);
        }
    }

    @Action(RelatedDatasets.Delete)
    DeleteRelatedDataset(ctx: StateContext<GeneralMetadataStateModel>, action: RelatedDatasets.Delete) {
        const state = ctx.getState();
        const currentDatasets = [...(state.relatedDatasets || [])];
        if (action.index >= 0 && action.index < currentDatasets.length) {
            currentDatasets.splice(action.index, 1);
            ctx.patchState({ relatedDatasets: currentDatasets });
            this.saveRelatedDatasetsToComments(ctx, currentDatasets);
        }
    }

    // Helper to serialize Funders and save to comments
    private saveFundersToComments(ctx: StateContext<GeneralMetadataStateModel>, funders: any[]) {
        const state = ctx.getState();
        let comments = [...(state.comments || [])];
        
        // Remove existing Funder-related comments
        comments = comments.filter(c => !['Funder', 'Funder ROR ID', 'Grant Identifier'].includes(c.name));

        const names = funders.map(f => f.fundingOrganization.annotationValue).join(';');
        const rorIds = funders.map(f => f.fundingOrganization.termAccession).join(';');
        const grants = funders.map(f => f.grantIdentifier).join(';');

        if (names) comments.push({ name: 'Funder', value: names });
        if (rorIds) comments.push({ name: 'Funder ROR ID', value: rorIds });
        if (grants) comments.push({ name: 'Grant Identifier', value: grants });

        this.generalMetadataService.updateComments(comments, state.id).subscribe(
            (response) => {
                ctx.patchState({ comments });
                toastr.success('Funding details updated.', "Success");
            },
            (error) => {
                console.error("Failed to update funding comments", error);
                toastr.error('Failed to update funding details.', "Error");
            }
        );
    }

    // Helper to serialize Related Datasets and save to comments
    private saveRelatedDatasetsToComments(ctx: StateContext<GeneralMetadataStateModel>, datasets: any[]) {
        const state = ctx.getState();
        let comments = [...(state.comments || [])];
        
        // Remove existing Related Dataset comments
        comments = comments.filter(c => !['Related Data Accession', 'Related Data Repository'].includes(c.name));

        const accessions = datasets.map(d => d.accession).join(';');
        const repos = datasets.map(d => d.repository).join(';');

        if (accessions) comments.push({ name: 'Related Data Accession', value: accessions });
        if (repos) comments.push({ name: 'Related Data Repository', value: repos });

        this.generalMetadataService.updateComments(comments, state.id).subscribe(
            (response) => {
                ctx.patchState({ comments });
                toastr.success('Related datasets updated.', "Success");
            },
            (error) => {
                console.error("Failed to update related datasets comments", error);
                toastr.error('Failed to update related datasets.', "Error");
            }
        );
    }


    @Selector()
    static funders(state: GeneralMetadataStateModel): any[] {
        return state?.funders;
    }

    @Selector()
    static relatedDatasets(state: GeneralMetadataStateModel): any[] {
        return state?.relatedDatasets;
    }
}

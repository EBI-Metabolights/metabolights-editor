import { Action, Selector, State, StateContext } from "@ngxs/store";
import { MTBLSPerson } from "src/app/models/mtbl/mtbls/mtbls-person";
import { MTBLSPublication } from "src/app/models/mtbl/mtbls/mtbls-publication";
import { Identifier } from "./general-metadata.actions";
import { Injectable } from "@angular/core";


export interface GeneralMetadataStateModel {
    id: string;
    title: string;
    description: string; // analogous to abstract
    submissionDate: Date;
    releaseDate: Date;
    status: string;
    reviewerLink: any;
    publications: MTBLSPublication[];
    people: MTBLSPerson[];
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
    constructor() {
    }

    @Action(Identifier.Set)
    SetStudyIdentifier(ctx: StateContext<GeneralMetadataStateModel>, action: Identifier.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            id: action.id
        })
    }

    @Selector()
    static id(state: GeneralMetadataStateModel): string {
        return state.id
    }
}
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Descriptors, Factors } from "./descriptors.action";
import { JsonConvert } from "json2typescript";


export interface DescriptorsStateModel {
    designDescriptors: Ontology[]
    factors: MTBLSFactor[]
}

@State<DescriptorsStateModel> ({
    name: 'descriptors',
    defaults: {
        designDescriptors: null,
        factors: null
    }
})
@Injectable()
export class DescriptorsState {
    
    @Action(Descriptors.Set)
    SetDesignDescriptors(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Set) {
        const state = ctx.getState();
        const temp = [];
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawDescriptors.forEach((descriptor) => {
          temp.push(jsonConvert.deserialize(descriptor, Ontology));
        });
        ctx.setState({
            ...state,
            designDescriptors: temp
        });
    }

    @Action(Factors.Set)
    SetFactors(ctx: StateContext<DescriptorsStateModel>, action: Factors.Set) {
        const state = ctx.getState();
        const temp = [];
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawFactors.forEach((protocol) => {
            temp.push(jsonConvert.deserialize(protocol, MTBLSFactor));
        });
        ctx.setState({
            ...state,
            factors: temp
        })
    }

    @Selector()
    static studyDesignDescriptors(state: DescriptorsStateModel): Ontology[] {
        return state.designDescriptors
    }

    @Selector()
    static studyFactors(state: DescriptorsStateModel): MTBLSFactor[] {
        return state.factors
    }
}
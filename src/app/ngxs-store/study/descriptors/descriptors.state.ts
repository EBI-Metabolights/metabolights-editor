import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Descriptors, Factors } from "./descriptors.action";
import { JsonConvert } from "json2typescript";
import { DescriptorsService } from "src/app/services/decomposed/descriptors.service";
import { IStudyDesignDescriptor } from "src/app/models/mtbl/mtbls/interfaces/study-design-descriptor.interface";


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

    constructor(private descriptorsService: DescriptorsService) {

    }

    @Action(Descriptors.Get)
    GetDesignDescriptors(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Get) {
        this.descriptorsService.getDesignDescriptors(action.id).subscribe(
            (response) => {
                ctx.dispatch(new Descriptors.Set(response.studyDesignDescriptors)) 
            }
        )
        
    }

    @Action(Descriptors.New)
    SaveDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.New) {
        this.descriptorsService.saveDesignDescriptor(action.descriptor, action.id).subscribe(
            (response) => {
                // this will not work as intended, the response from this endpoint is the new design descriptor solely, not the whole list
                ctx.dispatch(new Descriptors.Set(response.studyDesignDescriptors, true));
            }
        )
    }

    @Action(Descriptors.Update)
    UpdateDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Update) {
        this.descriptorsService.updateDesignDescriptor(action.annotationValue, action.descriptor, action.id).subscribe(
            (response) => {
                ctx.dispatch(new Descriptors.Set(response.studyDesignDescriptors, true));
            }
        )
    }

    @Action(Descriptors.Delete)
    DeleteDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Delete) {
        this.descriptorsService.deleteDesignDescriptor(action.annotationValue, action.id).subscribe(
            (response) => {
                
            }
        )
    }
    
    @Action(Descriptors.Set)
    SetDesignDescriptors(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Set) {
        const state = ctx.getState();
        let temp = [];
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawDescriptors.forEach((descriptor) => {
          temp.push(jsonConvert.deserialize(descriptor, Ontology));
        });

        if (action.extend) temp = temp.concat(state.designDescriptors)
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
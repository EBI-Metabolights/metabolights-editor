import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSFactor } from "src/app/models/mtbl/mtbls/mtbls-factor";
import { Descriptors, Factors, ResetDescriptorsState } from "./descriptors.action";
import { JsonConvert } from "json2typescript";
import { DescriptorsService } from "src/app/services/decomposed/descriptors.service";
import { GeneralMetadataState } from "../general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import * as toastr from "toastr";



export interface DescriptorsStateModel {
    designDescriptors: Ontology[]
    factors: MTBLSFactor[]
}
const defaultState: DescriptorsStateModel = {
    designDescriptors: null,
    factors: null
}
@State<DescriptorsStateModel> ({
    name: 'descriptors',
    defaults: defaultState
})
@Injectable()
export class DescriptorsState {

    descriptorToastrSettings: Record<string, any> = {
        timeOut: "2500",
        positionClass: "toast-top-center",
        preventDuplicates: true,
        extendedTimeOut: 0,
        tapToDismiss: false,
      }

      studyId$: Observable<string> = inject(Store).select(GeneralMetadataState.id);

    constructor(private descriptorsService: DescriptorsService) {

    }

    @Action(Descriptors.Get)
    GetDesignDescriptors(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Get) {
        this.descriptorsService.getDesignDescriptors(action.id).subscribe(
            (response) => {
                ctx.dispatch(new Descriptors.Set(response.studyDesignDescriptors)) 
            },
            (error) => {
                console.error(`Could not retrieve descriptors`)
            }
        )
        
    }

    @Action(Descriptors.New)
    SaveDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.New) {
        this.descriptorsService.saveDesignDescriptor(action.descriptor, action.id).subscribe(
            (response) => {
                ctx.dispatch(new Descriptors.Set([response], true));
                let toastrSettingsTemp = {
                    timeOut: "2500",
                    positionClass: "toast-top-center",
                    preventDuplicates: true,
                    extendedTimeOut: 0,
                    tapToDismiss: false,
                  }
                toastr.success('Design descriptor saved.', "Success", toastrSettingsTemp);
            },
            (error) => {
                console.error(`Could not add descriptor`)
            }
        )
    }

    @Action(Descriptors.Update)
    UpdateDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Update) {
        this.descriptorsService.updateDesignDescriptor(action.annotationValue, action.descriptor, action.id).subscribe(
            (response) => {
                /**
                 * It may be hard to figure out which descriptor is new. Easy option for this is to just get 
                 * the entire list of descriptors again - OR change the API response for this request (and for all requests)
                 * where you're updating an item that exists as within a list of items, to return _all_ items even if youre only updating one
                 * (perhaps enabled by a query param). That involves API changes, so for now, might just make the extra http request / obtain 
                 * the study ID via a subcription from this state container.
                 */
                //ctx.dispatch(new Descriptors.Set([response], true));
                this.studyId$.pipe(take(1)).subscribe((value) => {
                    ctx.dispatch(new Descriptors.Get(value))
                    toastr.success('Design descriptor updated.', "Success", this.descriptorToastrSettings);

                });

            },
            (error) => {
                console.error(`Could not update descriptor ${action.annotationValue}`)
            }
        )
    }

    @Action(Descriptors.Delete)
    DeleteDesignDescriptor(ctx: StateContext<DescriptorsStateModel>, action: Descriptors.Delete) {
        this.descriptorsService.deleteDesignDescriptor(action.annotationValue, action.id).subscribe(
            (response) => {
                ctx.dispatch( new Descriptors.Get(action.id));
                toastr.success('Design descriptor deleted.', "Success", this.descriptorToastrSettings);

            },
            (error) => {
                console.error(`Could not delete descriptor ${action.annotationValue}`)
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
        let temp = [];
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawFactors.forEach((protocol) => {
            temp.push(jsonConvert.deserialize(protocol, MTBLSFactor));
        });
        let currentFactors = state.factors
        if (action.extend) temp = temp.concat(currentFactors)
        ctx.setState({
            ...state,
            factors: temp
        })
    }

    @Action(Factors.Get)
    GetFactors(ctx: StateContext<DescriptorsStateModel>, action: Factors.Get) {
        const state = ctx.getState();
        this.descriptorsService.getFactors(action.id).subscribe(
            (response) => {
                ctx.dispatch(new Factors.Set(response.factors));
            },
            (error) => {
                console.error("Could not retrieve factors.")
            }
        )
    }

    @Action(Factors.Update)
    UpdateFactor(ctx: StateContext<DescriptorsStateModel>, action: Factors.Update) {
        const state = ctx.getState();
        this.descriptorsService.updateFactor(action.id, action.name, action.factor).subscribe(
            (response) => {
                //ctx.dispatch(new Factors.Set(response.factors, true));
                ctx.dispatch(new Factors.Get(action.id));
            },
            (error) => {
                console.error(`Could not update factor ${action.name}`);
            }
        )
    }

    @Action(Factors.Add)
    AddFactor(ctx: StateContext<DescriptorsStateModel>, action: Factors.Add) {
        const state = ctx.getState();
        this.descriptorsService.saveFactor(action.id, action.factor).subscribe(
            (response) => {
                ctx.dispatch(new Factors.Set([response], true));
            },
            (error) => {
                console.error(`Could not add factor`);
            }
        )
    }

    @Action(Factors.Delete)
    DeleteFactor(ctx: StateContext<DescriptorsStateModel>, action: Factors.Delete) {
        this.descriptorsService.deleteFactor(action.id, action.factorName).subscribe(
            (response) => {
                ctx.dispatch(new Factors.Get(action.id));
            },
            (error) => {
                console.error(`Could not delete factor ${action.factorName}`);
            }
            )
    }

    @Action(ResetDescriptorsState)
    Reset(ctx: StateContext<DescriptorsStateModel>, action: ResetDescriptorsState) {
        ctx.setState(defaultState);
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
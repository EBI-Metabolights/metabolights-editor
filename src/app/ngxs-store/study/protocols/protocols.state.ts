import { Action, Select, Selector, State, StateContext } from "@ngxs/store";
import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface";
import { Protocols } from "./protocols.actions";
import { JsonConvert } from "json2typescript";
import { Injectable } from "@angular/core";
import { MTBLSProtocol } from "src/app/models/mtbl/mtbls/mtbls-protocol";
import { ProtocolsService } from "src/app/services/decomposed/protocols.service";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { GeneralMetadataState } from "../general-metadata/general-metadata.state";
import { Observable } from "rxjs";

export interface ProtocolsStateModel {
    protocols: MTBLSProtocol[]
}

@State<ProtocolsStateModel>({
    name: 'protocols',
    defaults: {
        protocols: null
    }
})
@Injectable()
export class ProtocolsState {

    @Select(GeneralMetadataState.id) studyId$: Observable<string>;
    private id: string = null;

    constructor(private protocolsService: ProtocolsService) {
        this.studyId$.subscribe(id => this.id = id)
    }

    @Action(Protocols.Set)
    SetProtocols(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Set) {
        const state = ctx.getState();
        const temp = []
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawProtocols.forEach((protocol) => {
            temp.push(jsonConvert.deserialize(protocol, MTBLSProtocol));
          });
        ctx.setState({
            ...state,
            protocols: temp
        })
    }

    @Action(Protocols.Get)
    GetProtocols(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Get) {
        const state = ctx.getState();
        this.protocolsService.getProtocols(this.id).subscribe(
            (response) => {
                ctx.dispatch(new Protocols.Set(response.protocols as IProtocol[]));
            }
        )
    }

    @Selector()
    static protocols(state: ProtocolsStateModel): MTBLSProtocol[] {
        return state.protocols
    }
}

import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface";
import { Protocols } from "./protocols.actions";
import { JsonConvert } from "json2typescript";
import { Injectable } from "@angular/core";
import { MTBLSProtocol } from "src/app/models/mtbl/mtbls/mtbls-protocol";

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

    @Selector()
    static protocols(state: ProtocolsStateModel): MTBLSProtocol[] {
        return state.protocols
    }
}

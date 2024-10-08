import { Action, Select, Selector, State, StateContext, createSelector } from "@ngxs/store";
import { IProtocol } from "src/app/models/mtbl/mtbls/interfaces/protocol.interface";
import { ProtocolGuides, Protocols, ResetProtocolsState } from "./protocols.actions";
import { JsonConvert } from "json2typescript";
import { Injectable } from "@angular/core";
import { MTBLSProtocol } from "src/app/models/mtbl/mtbls/mtbls-protocol";
import { ProtocolsService } from "src/app/services/decomposed/protocols.service";
import { GeneralMetadataService } from "src/app/services/decomposed/general-metadata.service";
import { GeneralMetadataState } from "../general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { RowTemplateService } from "src/app/services/row-template/row-template.service";

export interface ProtocolsStateModel {
    protocols: MTBLSProtocol[]
    guides: Record<string, string>
}
const defaultState: ProtocolsStateModel = {
    protocols: null,
    guides: {
        "Sample collection": "",
        "Extraction": "",
        "Chromatography": "",
        "Mass spectrometry": "",
        "Data transformation": "",
        "Metabolite identification": ""
    }
}

@State<ProtocolsStateModel>({
    name: 'protocols',
    defaults: defaultState
})
@Injectable()
export class ProtocolsState {

    @Select(GeneralMetadataState.id) studyId$: Observable<string>;
    private id: string = null;

    constructor(private protocolsService: ProtocolsService, private rowTemplateService: RowTemplateService) {
        this.studyId$.subscribe(id => this.id = id)
    }

    @Action(Protocols.Set)
    SetProtocols(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Set) {
        const state = ctx.getState();
        ctx.dispatch(new ProtocolGuides.Get);

        let temp = []
        const jsonConvert: JsonConvert = new JsonConvert();
        action.rawProtocols.forEach((protocol) => {
            temp.push(jsonConvert.deserialize(protocol, MTBLSProtocol));
          });
        let currentStateProtocols = state.protocols
        if (action.updatedProtocol) currentStateProtocols = removeObjectsByFieldValue(currentStateProtocols, "name", action.rawProtocols[0].name)
        if (action.extend) temp = temp.concat(currentStateProtocols);
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

    @Action(Protocols.Add)
    AddProtocol(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Add) {
        const state = ctx.getState();
        this.protocolsService.saveProtocol(action.protocol, this.id).subscribe(
            (response) => {
                ctx.dispatch(new Protocols.Set([response], true));
            }
        )
    }

    @Action(Protocols.Delete)
    DeleteProtocol(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Delete) {
        const state = ctx.getState();
        this.protocolsService.deleteProtocol(action.name, this.id).subscribe(
            (response) => {
                ctx.dispatch(new Protocols.Get());
            }
        )
    }

    @Action(Protocols.Update)
    UpdateProtocol(ctx: StateContext<ProtocolsStateModel>, action: Protocols.Update) {
        const state = ctx.getState();
        this.protocolsService.updateProtocol(action.name, action.protocol, this.id).subscribe(
            (response) => {
                ctx.dispatch(new Protocols.Set([response], true, true));
            }
        )
    }

    @Action(ProtocolGuides.Set)
    SetProtocolGuides(ctx: StateContext<ProtocolsStateModel>, action: ProtocolGuides.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            guides: action.guides
        })
    }

    @Action(ProtocolGuides.Get)
    GetProtocolGuides(ctx: StateContext<ProtocolsStateModel>, action: ProtocolGuides.Get) {
        this.rowTemplateService.getProtocolGuides().subscribe((guides) => {
            ctx.dispatch(new ProtocolGuides.Set(guides));
        })
    }

    @Action(ResetProtocolsState)
    Reset(ctx: StateContext<ProtocolsStateModel>, action: ResetProtocolsState) {
        ctx.setState(defaultState);
    }

    @Selector()
    static protocols(state: ProtocolsStateModel): MTBLSProtocol[] {
        return state.protocols
    }

    @Selector()
    static protocolGuides(state: ProtocolsStateModel): Record<string, string> {
        return state.guides
    }

    static specificProtocol(protocolName: string) {
        return createSelector([ProtocolsState], (state: ProtocolsStateModel) => {
            // returning static ref [0] as there will never be duplicate names
            return state.protocols.filter(prot => prot.name === protocolName)[0]
        })
    }

    static specificGuide(guideName: string) {
        return createSelector([ProtocolsState], (state: ProtocolsStateModel) => {
            if (Object.keys(state.guides).includes(guideName)) return state.guides[guideName]
            else return ""
        })
    }
}

export function removeObjectsByFieldValue<T>(array: T[], fieldName: keyof T, fieldValue: any): T[] {
    return array.filter(obj => obj[fieldName] !== fieldValue);
  }
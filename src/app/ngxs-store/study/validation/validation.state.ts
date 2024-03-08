import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { EditorValidationRules, ValidationReport } from "./validation.actions";
import { ValidationService } from "src/app/services/decomposed/validation.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";

export interface ValidationStateModel {
    rules: Record<string, any>;
    report: IValidationSummary
}

@State<ValidationStateModel>({
    name: 'validation',
    defaults: {
        rules: null,
        report: null
    }
})
@Injectable()
export class ValidationState {

    constructor(private validationService: ValidationService, private store: Store) {}
    

    @Action(EditorValidationRules.Get)
    GetValidationRules(ctx: StateContext<ValidationStateModel>) {
        this.validationService.getValidationRules().subscribe(
            (rules) => {
                this.store.dispatch(new SetLoadingInfo(this.validationService.loadingRulesMessage));
                ctx.dispatch(new EditorValidationRules.Set(rules));
            },
            (error) => {
                console.error(`Unable to retrieve tha validations.json rules file for the editor: ${error}`)
            }
        )
    }

    @Action(EditorValidationRules.Set)
    SetValidationRules(ctx: StateContext<ValidationStateModel>, action: EditorValidationRules.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            rules: action.rules
        });
    }

    @Action(ValidationReport.Get)
    GetValidationReport(ctx: StateContext<ValidationStateModel>) {
        this.validationService.getValidationReport().subscribe(
            (report) => {
                this.store.dispatch(new Loading.Disable());
                ctx.dispatch(new ValidationReport.Set(report));
            },
            (error) => {
                console.error(`Could not get validation report: ${error}`)
                this.store.dispatch(new Loading.Disable());

            }
        );

    }

    @Action(ValidationReport.Set)
    SetValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            report: action.report
        })

    }

    @Selector()
    static rules(state: ValidationStateModel): Record<string, any> {
        return state.rules
    }

    @Selector()
    static report(state: ValidationStateModel): Record<string, any> {
        return state.report
    }
}
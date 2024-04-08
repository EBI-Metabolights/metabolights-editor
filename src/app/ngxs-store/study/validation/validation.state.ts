import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { EditorValidationRules, ValidationReport } from "./validation.actions";
import { ValidationService } from "src/app/services/decomposed/validation.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";
import { interval } from "rxjs";

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
            rules: action.rules["study"]
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
            report: action.report.validation
        });
    }

    @Action(ValidationReport.Refresh)
    RefreshValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Refresh) {
        const state = ctx.getState();
        this.validationService.refreshValidations().subscribe(
            (response) => {
                this.store.dispatch(new SetLoadingInfo("Loading study validations"));
                ctx.dispatch(EditorValidationRules.Get);
            },
            (error) => {
                console.log("Unable to start new validation run.")
                console.log(error)
            }
        )
    }

    @Action(ValidationReport.ContinualRetry)
    ContinuallyRetryValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.ContinualRetry){
        let repeat = 0;
        this.validationService.getValidationReport().subscribe(reportResponse => {
          if (reportResponse.validation.status === "not ready"){
            const validationReportPollInvertal = interval(action.interval);
            const validationReportLoadSubscription = validationReportPollInvertal.subscribe(x => {
              this.validationService.getValidationReport().subscribe(nextReportResponse => {
                repeat = repeat + 1;
              if (nextReportResponse.validation.status !== "not ready"){
                validationReportLoadSubscription.unsubscribe();
                ctx.dispatch(new ValidationReport.Set(nextReportResponse))
              }
              if (repeat > action.retries) {
                validationReportLoadSubscription.unsubscribe();
                ctx.dispatch(new ValidationReport.Set(nextReportResponse))
              }
              });
            });
          } else {
                ctx.dispatch(new ValidationReport.Set(reportResponse))
          }
        });
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
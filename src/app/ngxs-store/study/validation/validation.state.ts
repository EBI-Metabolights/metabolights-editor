import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store, createSelector } from "@ngxs/store";
import { EditorValidationRules, NewValidationReport, ValidationReport } from "./validation.actions";
import { ValidationService } from "src/app/services/decomposed/validation.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";

import { interval } from "rxjs";
import { ValidationReportInterface, Violation } from "src/app/components/study/validations/validations-protoype/interfaces/validation-report.interface";
import { filter } from "rxjs-compat/operator/filter";

export interface ValidationStateModel {
    rules: Record<string, any>;
    report: IValidationSummary;
    newReport: ValidationReportInterface
}

@State<ValidationStateModel>({
    name: 'validation',
    defaults: {
        rules: null,
        report: null,
        newReport: null
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

    @Action(NewValidationReport.Get)
    GetNewValidationReport(ctx: StateContext<ValidationStateModel>, action: NewValidationReport.Get) {
        if (action.ws3) {
            this.validationService.getNewValidationReportWs3().subscribe(
                (response) => {
                    ctx.dispatch(new NewValidationReport.Set(response.content.task_result.messages));
                },
            (error)=> {
                console.log("Could not get new ws3 report");
                console.log(JSON.stringify(error));
            })
        } else {
            this.validationService.getNewValidationReport().subscribe((response) => {
                ctx.dispatch(new NewValidationReport.Set(response));
            });
        }


    }

    @Action(NewValidationReport.Set)
    SetNewValidationReport(ctx: StateContext<ValidationStateModel>, action: NewValidationReport.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            newReport: action.report
        })
    }

    @Action(ValidationReport.Refresh)
    RefreshValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Refresh) {
        const state = ctx.getState();
        this.validationService.refreshValidations().subscribe(
            (response) => {
                this.store.dispatch(new SetLoadingInfo("Loading study validations"));
                ctx.dispatch(new EditorValidationRules.Get());
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

    @Action(ValidationReport.Override)
    OverrideValidationRule(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Override) {
        const state = ctx.getState();
        this.validationService.overrideValidations(action.rule).subscribe(
            (response) => {
                ctx.dispatch(new ValidationReport.Get());
            },
            (error) => {
                console.log("Could not override validation rule.");
            }
        )
    }

    @Selector()
    static rules(state: ValidationStateModel): Record<string, any> {
        return state.rules
    }

    @Selector()
    static report(state: ValidationStateModel): Record<string, any> {
        return state.report
    }

    @Selector()
    static newReport(state: ValidationStateModel): ValidationReportInterface {
        return state.newReport
    }

    @Selector()
    static newReportViolationsAll(state: ValidationStateModel) {
        let violations = state.newReport.violations;
        violations = sortViolations(violations);
        return violations;
    }

    static newReportViolations(section: string) {
        return createSelector([ValidationState], (state: ValidationStateModel) => {
            return sortViolations(
                filterViolations(
                    state.newReport.violations, section
                )
            );
        });
    }

    @Selector()
    static newReportSummariesAll(state: ValidationStateModel) {
        return state.newReport.summary;
    }

    static newReportSummaries(section: string) {
        return createSelector([ValidationState], (state: ValidationStateModel) => {
            return filterViolations(state.newReport.summary, section)
        });
    }   
}


function filterViolations(violations: Violation[], filterSectionStart: string): Violation[] {
    return violations.filter(violation => violation.section.startsWith(filterSectionStart));
}

function sortViolations(violations: Violation[]): Violation[] {
    // Define the ordering for type and priority explicitly
    const typeOrder = { 'ERROR': 1, 'WARNING': 2 };
    const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };

    return violations.sort((a, b) => {
        // Get type rank; default to a high number if type is not known
        const typeRankA = typeOrder[a.type] || 999;
        const typeRankB = typeOrder[b.type] || 999;

        // If types are the same, sort by priority
        if (typeRankA === typeRankB) {
            const priorityRankA = priorityOrder[a.priority] || 999;
            const priorityRankB = priorityOrder[b.priority] || 999;
            return priorityRankA - priorityRankB;
        }

        // Else, sort by type
        return typeRankA - typeRankB;
    });
}


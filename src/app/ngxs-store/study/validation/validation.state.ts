import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store, createSelector } from "@ngxs/store";
import { EditorValidationRules, ResetValidationState, SetInitialLoad, ValidationReport, ValidationReportV2 } from "./validation.actions";
import { ValidationService } from "src/app/services/decomposed/validation.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";

import { interval, withLatestFrom } from "rxjs";
import { ViolationType } from "src/app/components/study/validations-v2/interfaces/validation-report.types";
import { ValidationPhase, Violation, Ws3ValidationReport } from "src/app/components/study/validations-v2/interfaces/validation-report.interface";
import { GeneralMetadataState } from "../general-metadata/general-metadata.state";


export interface ValidationTask {
    id: string;
    ws3TaskStatus: string;
}



export interface ValidationStateModel {
    rules: Record<string, any>;
    report: IValidationSummary;
    reportV2: Ws3ValidationReport;
    taskId: string;
    status: ViolationType;
    lastRunTime: string;
    currentValidationTask: ValidationTask;
    history: Array<ValidationPhase>;
    initialLoadMade: boolean;
}
const defaultState: ValidationStateModel = {
    rules: null,
    report: null,
    reportV2: null,
    taskId: null,
    status: null,
    lastRunTime: null,
    currentValidationTask: null,
    history: [],
    initialLoadMade: false
}
@State<ValidationStateModel>({
    name: 'validation',
    defaults: defaultState
})
@Injectable()
export class ValidationState {

    constructor(private validationService: ValidationService, private store: Store) {}
    

    @Action(EditorValidationRules.Get)
    GetValidationRules(ctx: StateContext<ValidationStateModel>) {
        this.validationService.getValidationRules().subscribe({
            next: (rules) => {
                this.store.dispatch(new SetLoadingInfo(this.validationService.loadingRulesMessage));
                ctx.dispatch(new EditorValidationRules.Set(rules));
            },
            error: (error) => {
                console.error(`Unable to retrieve the validations.json rules file for the editor: ${error}`)
            }
        })
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
    GetValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Get) {
        this.validationService.getValidationReport(action.studyId).subscribe({
            next: (report) => {
                this.store.dispatch(new Loading.Disable());
                ctx.dispatch(new ValidationReport.Set(report));
            },
            error: (error) => {
                console.error(`Could not get validation report: ${error}`)
                this.store.dispatch(new Loading.Disable());
            }
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

    @Action(ValidationReportV2.Get)
    GetNewValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Get) {
        if (!action.test) {
            this.validationService.getValidationV2Report(action.proxy, action.taskId, action.studyId).subscribe( 
                (response) => {
                    if (response.status !== 'error') {
                        const currentTask = {id: response.content.task_id, ws3TaskStatus: response.content.task_status}
                        ctx.dispatch(new ValidationReportV2.SetCurrentTask(currentTask))
                        if (response.content.task_status === "SUCCESS") {
                            ctx.dispatch(new ValidationReportV2.Set(response.content.task_result));
                            ctx.dispatch(new ValidationReportV2.SetTaskID(response.content.task_id));
                            ctx.dispatch(new ValidationReportV2.SetValidationStatus(calculateStudyValidationStatus(response.content.task_result)));
                            ctx.dispatch(new ValidationReportV2.SetLastRunTime(response.content.task_result.completion_time))
                        } else {
                            // some other task status handling here "INITIATED, STARTED, PENDING, FAILURE" etc
                        }


                    } else {
                        const currentTask = {id: null, ws3TaskStatus: "ERROR"}
                        ctx.dispatch(new ValidationReportV2.SetCurrentTask(currentTask))
                        console.log("Could not get new ws3 report");
                        console.log(JSON.stringify(response.errorMessage));
                    }
                },
                (error)=> {
                    console.log("Could not get new ws3 report");
                    console.log(JSON.stringify(error));
                })
        } else {
            /**this.validationService.getNewValidationReport().subscribe((response) => {
                ctx.dispatch(new NewValidationReport.Set({study_id: "test", duration_in_seconds: 5,completion_time: "0.00", messages: response}));
            });*/

            this.validationService.getFakeValidationReportApiResponse().subscribe((response) => {
                ctx.dispatch(new ValidationReportV2.Set(response.content.task_result));
                ctx.dispatch(new ValidationReportV2.SetTaskID(response.content.task_id));
                ctx.dispatch(new ValidationReportV2.SetValidationStatus(calculateStudyValidationStatus(response.content.task_result)));
                ctx.dispatch(new ValidationReportV2.SetLastRunTime(response.content.task_result.completion_time))
            })
        }


    }

    @Action(ValidationReportV2.Set)
    SetNewValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Set) {
        const state = ctx.getState();
        console.log('saving report: ')
        if (!state.initialLoadMade) {
            ctx.dispatch(new SetInitialLoad(true));
        }
        ctx.setState({
            ...state,
            reportV2: action.report
        })
    }

    @Action(ValidationReportV2.InitialiseValidationTask)
    InitNewValidationTask(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.InitialiseValidationTask) {
        this.validationService.createStudyValidationTask(action.proxy, action.studyId).subscribe(
            (response) => {
                console.log('task submitted successfully');
                console.log(response);
                ctx.dispatch(new ValidationReportV2.SetCurrentTask({id: response.content.task_id, ws3TaskStatus: response.content.task_status}))
                //this.store.dispatch(new NewValidationReport.Set(response.content.task_result));
            },
            (error) => {
                console.log('could not submit validation task');
                console.log(JSON.stringify(error));
            }
        )
    }

    @Action(ValidationReportV2.SetTaskID)
    SetTaskID(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.SetTaskID) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            taskId: action.id
        });
    }

    @Action(ValidationReportV2.SetValidationStatus)
    SetValidationStatus(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.SetValidationStatus) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            status: action.status
        });
    }

    @Action(ValidationReportV2.SetLastRunTime)
    SetLastRunTime(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.SetLastRunTime) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            lastRunTime: action.time
        });
    }

    @Action(ValidationReportV2.SetCurrentTask)
    SetCurrentTask(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.SetCurrentTask) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            currentValidationTask: action.task
        });
    }

    @Action(ValidationReportV2.History.Get)
    GetHistory(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.History.Get) {
        const state = ctx.getState();
        this.validationService.getValidationHistory(action.studyId).subscribe((historyResponse) => {
            ctx.dispatch(new ValidationReportV2.History.Set(historyResponse.content));
            if (!state.initialLoadMade) {
                console.log('hit initial load not made block')
                ctx.dispatch(new ValidationReportV2.Get(action.studyId, historyResponse.content[0].taskId))
            }
        },
        (error) => {
            console.error(`Could not get history for current study: ${error}`);
        })
    }

    @Action(ValidationReportV2.History.Set)
    SetHistory(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.History.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            history: action.history
        });
    }

    @Action(ValidationReport.Refresh)
    RefreshValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.Refresh) {
        const state = ctx.getState();
        this.validationService.refreshValidations(action.studyId).subscribe(
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
        this.validationService.getValidationReport(action.studyId).subscribe(reportResponse => {
          if (reportResponse.validation.status === "not ready"){
            const validationReportPollInvertal = interval(action.interval);
            const validationReportLoadSubscription = validationReportPollInvertal.subscribe(x => {
              this.validationService.getValidationReport(action.studyId).subscribe(nextReportResponse => {
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
        this.validationService.overrideValidations(action.rule, action.studyId).subscribe(
            (response) => {
                ctx.dispatch(new ValidationReport.Get(action.studyId));
            },
            (error) => {
                console.log("Could not override validation rule.");
            }
        )
    }

    @Action(ResetValidationState)
    Reset(ctx: StateContext<ValidationStateModel>, action: ResetValidationState) {
        ctx.setState(defaultState);
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
    static reportV2(state: ValidationStateModel): Ws3ValidationReport {
        return state.reportV2
    }

    @Selector()
    static reportV2ViolationsAll(state: ValidationStateModel) {
        if (state.reportV2 === null) { return [] }
        let violations = state.reportV2.messages.violations;
        violations = sortViolations(violations);
        return violations;
    }

    static reportV2Violations(section: string) {
        return createSelector([ValidationState], (state: ValidationStateModel) => {
            if (state.reportV2 === null) { return [] }
            return sortViolations(
                filterViolations(
                    state.reportV2.messages.violations, section
                )
            );
        });
    }

    @Selector()
    static reportV2SummariesAll(state: ValidationStateModel) {
        return state.reportV2.messages.summary;
    }

    static reportV2Summaries(section: string) {
        return createSelector([ValidationState], (state: ValidationStateModel) => {
            return filterViolations(state.reportV2.messages.summary, section)
        });
    }

    @Selector()
    static history(state: ValidationStateModel) {
        return state.history;
    }

    @Selector()
    static initialLoadMade(state: ValidationStateModel) {
        return state.initialLoadMade
    }

    @Selector()
    static taskId(state: ValidationStateModel) {
        return state.taskId;
    }

    @Selector()
    static validationStatus(state: ValidationStateModel) {
        return state.status
    }

    @Selector()
    static lastValidationRunTime(state: ValidationStateModel) {
        return state.lastRunTime
    }

    @Selector()
    static currentValidationTask(state: ValidationStateModel) {
        return state.currentValidationTask;
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

function calculateStudyValidationStatus(report: Ws3ValidationReport): ViolationType {
    if (report.messages.violations.length > 0) return 'ERROR'
    else return 'SUCCESS'
}

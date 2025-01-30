import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store, createSelector } from "@ngxs/store";
import { EditorValidationRules, ResetValidationState, SetInitialLoad, SetValidationRunNeeded, ValidationReport, ValidationReportV2 } from "./validation.actions";
import { ValidationService } from "src/app/services/decomposed/validation.service";
import { Loading, SetLoadingInfo } from "../../non-study/transitions/transitions.actions";
import { IValidationSummary } from "src/app/models/mtbl/mtbls/interfaces/validation-summary.interface";

import { interval, timer, withLatestFrom } from "rxjs";
import { ViolationType } from "src/app/components/study/validations-v2/interfaces/validation-report.types";
import { Breakdown, FullOverride, ValidationPhase, Violation, Ws3ValidationReport } from "src/app/components/study/validations-v2/interfaces/validation-report.interface";
import { ToastrService } from "src/app/services/toastr.service";

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
    overrides: Array<FullOverride>;
    history: Array<ValidationPhase>;
    initialLoadMade: boolean;
    newValidationRunNeeded: boolean;
}
const defaultState: ValidationStateModel = {
    rules: null,
    report: null,
    reportV2: null,
    taskId: null,
    status: null,
    lastRunTime: null,
    currentValidationTask: null,
    overrides: [],
    history: [],
    initialLoadMade: false,
    newValidationRunNeeded: false
}
@State<ValidationStateModel>({
    name: 'validation',
    defaults: defaultState
})
@Injectable()
export class ValidationState {

    constructor(private validationService: ValidationService, private store: Store, private toastrService: ToastrService) {}
    

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
                        ctx.dispatch(new ValidationReportV2.SetCurrentTask(currentTask));
                        ctx.dispatch( new ValidationReportV2.Override.GetAll(action.studyId));
                        if (response.content.task_status === "SUCCESS") {
                            ctx.dispatch(new ValidationReportV2.Set(response.content.task_result));
                            ctx.dispatch(new ValidationReportV2.SetTaskID(response.content.task_id));
                            ctx.dispatch(new ValidationReportV2.SetValidationStatus(calculateStudyValidationStatus(response.content.task_result)));
                            ctx.dispatch(new ValidationReportV2.SetLastRunTime(response.content.task_result.completion_time));
                            ctx.dispatch(new SetInitialLoad(true));
                        } else {
                            // some other task status handling here "INITIATED, STARTED, PENDING, FAILURE" etc
                        }


                    } else {
                        const currentTask = {id: null, ws3TaskStatus: "ERROR"}
                        ctx.dispatch(new ValidationReportV2.SetCurrentTask(currentTask))
                        console.debug("Could not get new ws3 report");
                        console.debug(JSON.stringify(response.errorMessage));
                    }
                },
                (error)=> {
                    console.log("Could not get new ws3 report");
                    console.log(JSON.stringify(error));
                })
        } else {
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
                ctx.dispatch(new SetValidationRunNeeded(false));
                ctx.dispatch(new ValidationReportV2.SetCurrentTask({id: response.content.task_id, ws3TaskStatus: response.content.task_status}))
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
        const stateTime = state.lastRunTime;
        
        if (stateTime === null || isMoreRecentISO8601(stateTime, action.time)) {
            ctx.setState({
                ...state,
                lastRunTime: action.time
            });
        }

    }

    @Action(ValidationReportV2.SetCurrentTask)
    SetCurrentTask(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.SetCurrentTask) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            currentValidationTask: action.task
        });
    }

    @Action(SetValidationRunNeeded)
    SetValidationRunNeeded(ctx: StateContext<ValidationStateModel>, action: SetValidationRunNeeded) {
        const state = ctx.getState();

        ctx.setState({
            ...state,
            newValidationRunNeeded: action.set
        })
    }

    @Action(ValidationReportV2.History.Get)
    GetHistory(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.History.Get) {
        const state = ctx.getState();
        this.validationService.getValidationHistory(action.studyId).subscribe((historyResponse) => {
            const sortedPhases = sortPhasesByTime(historyResponse.content);
            ctx.dispatch(new ValidationReportV2.History.Set(sortedPhases));
            if (!state.initialLoadMade) {
                ctx.dispatch(new ValidationReportV2.Get(action.studyId, sortedPhases[0].taskId))
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

    @Action(ValidationReportV2.Override.GetAll) 
    GetOverrides(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Override.GetAll) {
        const state = ctx.getState();
        this.validationService.getAllOverrides(action.studyId).subscribe({
            next: (response) => {
                ctx.dispatch(new ValidationReportV2.Override.Set(response.content.validationOverrides));
            },
            error: (error) => {
                console.error(`${error}`)
            }
        })
    }

    @Action([ValidationReportV2.Override.Create, ValidationReportV2.Override.Update])
    PatchOverride(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Override.Create | ValidationReportV2.Override.Update) {
        const state = ctx.getState();
        this.validationService.overrideRule(action.studyId, action.override).subscribe({
            next: (response) => {
                this.toastrService.pop(`Validation override for rule ${action.override.rule_id} applied`, "Success")
                ctx.dispatch(new ValidationReportV2.Override.Set(response.content.validationOverrides));
                ctx.dispatch(new ValidationReportV2.InitialiseValidationTask(false, action.studyId));
            },
            error: (e) => {
                console.log('unexpected error when creating override');
                console.error(e);
                this.toastrService.pop(`Unable to create override for ${action.override.rule_id}`, "Error");
            }
        })
    }

    @Action(ValidationReportV2.Override.Set)
    SetOverride(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Override.Set) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            overrides: action.overrides
        });
    }

    @Action(ValidationReportV2.Override.Delete)
    DeleteOverride(ctx: StateContext<ValidationStateModel>, action: ValidationReportV2.Override.Delete) {
        this.validationService.deleteOverride(action.studyId, action.overrideId).subscribe({
            next: (response) => {
                ctx.dispatch(new ValidationReportV2.Override.Set(response.content.validationOverrides));
                this.toastrService.pop(`Deleted Override ${action.overrideId}`, "Success");
                ctx.dispatch(new ValidationReportV2.InitialiseValidationTask(false, action.studyId));
                const t = timer(5000);
                t.subscribe(() => {
                    ctx.dispatch(new ValidationReportV2.Get(action.studyId));
                })
            },
            error: (error) => {
                console.error(`${error}`);
                this.toastrService.pop(`Could not delete override ${action.overrideId}`, "Error");
            }
        })
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
                console.log("Unable to start new validation run.");
                console.log(error);
            }
        )
    }

    @Action(ValidationReport.ContinualRetry)
    ContinuallyRetryValidationReport(ctx: StateContext<ValidationStateModel>, action: ValidationReport.ContinualRetry) {
        let repeat = 0;
        this.validationService.getValidationReport(action.studyId).subscribe(reportResponse => {
          if (reportResponse.validation.status === "not ready"){
            const validationReportPollInvertal = interval(action.interval);
            const validationReportLoadSubscription = validationReportPollInvertal.subscribe(x => {
              this.validationService.getValidationReport(action.studyId).subscribe(nextReportResponse => {
                repeat = repeat + 1;
              if (nextReportResponse.validation.status !== "not ready"){
                validationReportLoadSubscription.unsubscribe();
                ctx.dispatch(new ValidationReport.Set(nextReportResponse));
              }
              if (repeat > action.retries) {
                validationReportLoadSubscription.unsubscribe();
                ctx.dispatch(new ValidationReport.Set(nextReportResponse));
              }
              });
            });
          } else {
                ctx.dispatch(new ValidationReport.Set(reportResponse));
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

    @Action(SetInitialLoad)
    SetInitialLoad(ctx: StateContext<ValidationStateModel>, action: SetInitialLoad) {
        const state = ctx.getState();
        ctx.setState(({
            ...state,
            initialLoadMade: action.set
        }));

    }

    @Action(ResetValidationState)
    Reset(ctx: StateContext<ValidationStateModel>, action: ResetValidationState) {
        ctx.setState(defaultState);
    }

    

    @Selector()
    static rules(state: ValidationStateModel): Record<string, any> {
        if (state === undefined) { return null }
        return state.rules;
    }

    @Selector()
    static report(state: ValidationStateModel): Record<string, any> {
        return state.report;
    }

    @Selector()
    static reportV2(state: ValidationStateModel): Ws3ValidationReport {
        return state.reportV2;
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
                filterViolationsBySection(
                    state.reportV2.messages.violations, section
                )
            );
        });
    }

    static reportV2ViolationsByRuleId(ruleId) {
        return createSelector([ValidationState], (state: ValidationStateModel) => {
            if (state.reportV2 === null) { return [] }
            return sortViolations(
                filterViolationsByRuleId(
                    state.reportV2.messages.violations, ruleId
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
            return filterViolationsBySection(state.reportV2.messages.summary, section)
        });
    }

    @Selector()
    static history(state: ValidationStateModel) {
        return state.history;
    }

    @Selector()
    static initialLoadMade(state: ValidationStateModel) {
        return state.initialLoadMade;
    }

    @Selector()
    static taskId(state: ValidationStateModel) {
        return state.taskId;
    }

    @Selector()
    static validationStatus(state: ValidationStateModel) {
        return state.status;
    }

    @Selector()
    static lastValidationRunTime(state: ValidationStateModel) {
        return state.lastRunTime;
    }

    @Selector()
    static currentValidationTask(state: ValidationStateModel) {
        return state.currentValidationTask;
    }

    @Selector()
    static breakdown(state: ValidationStateModel): Breakdown {
        return {
            warnings: state.reportV2.messages.violations.filter(val => val.type === 'ERROR').length,
            errors: state.reportV2.messages.violations.filter(val => val.type === 'WARNING').length}
    }

    @Selector()
    static overrides(state: ValidationStateModel): Array<FullOverride> {
        return state.overrides;
    }

    @Selector()
    static validationNeeded(state: ValidationStateModel) {
        return state.newValidationRunNeeded;
    }

    static specificOverride(ruleId) {
        return createSelector([ValidationState], (state: ValidationStateModel) => { 
            const overrideList = state.overrides.filter(val => val.rule_id === ruleId);
            const val = overrideList[0] || null
            return val
        });
    }
}


function filterViolationsBySection(violations: Violation[], filterSectionStart: string): Violation[] {
    return violations.filter(violation => violation.section.startsWith(filterSectionStart));
}

function filterViolationsByRuleId(violations: Violation[], ruleId: string): Violation[] {
    return violations.filter(violation => violation.identifier === ruleId);
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
    const warningsFilteredOut = report.messages.violations.filter(vio => vio.type !== 'WARNING')
    if (warningsFilteredOut.length > 0) return 'ERROR'
    else return 'SUCCESS'
}


function sortPhasesByTime(phases: ValidationPhase[]): ValidationPhase[]{
    return phases.sort((a, b) => {
        const dateA = parseValidationTime(a.validationTime);
        const dateB = parseValidationTime(b.validationTime);
        return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });
  }

  function parseValidationTime(validationTime: string): Date {
    const [datePart, timePart] = validationTime.split('_');
    const [year, day, month] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split('-').map(Number);
    // Note: JavaScript Date uses 0-based months, so we subtract 1 from `month`
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  function isMoreRecentISO8601(dateString: string, comparatorString: string): boolean {
    // Parse the ISO8601 date strings into Date objects
    const date = new Date(dateString);
    const comparator = new Date(comparatorString);

    // Validate that the date strings are properly parsed
    if (isNaN(date.getTime()) || isNaN(comparator.getTime())) {
        throw new Error("Invalid ISO8601 date format. Please provide valid date strings.");
    }

    // Compare the dates
    return comparator > date;
}
  

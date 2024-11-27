import { ViolationPriority, ViolationType } from "./validation-report.types"

export interface Ws3Response<T> {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: T
}

export interface Ws3ValidationTask {
    task_id: string,
    task_status: string,
    message: string,
    task_result?: Ws3ValidationReport
}

export interface Ws3ValidationReport {
    study_id: string
    status: ViolationType,
    duration_in_seconds: number
    completion_time: string
    message?: Record<string, any>;
    messages?: ValidationReportContents
}


export interface ValidationReportContents {
    summary: Violation[]
    violations: Violation[]
}

export interface Violation {
    description: string
    hasMoreViolations: boolean
    identifier: string
    priority: ViolationPriority // will be an enum or custom type
    section: string // will be an enum or custom type
    sourceColumnHeader: string
    sourceColumnIndex: string
    sourceFile: string // this seems ambiguous to me
    title: string
    type: ViolationType // will be an enum or custom type
    values: string[]
    violation: string
}

export interface ValidationPhase {
    validationTime: string,
    taskId: string
}




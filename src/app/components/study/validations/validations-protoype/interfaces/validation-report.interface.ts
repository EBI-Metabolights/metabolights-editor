import { ViolationPriority, ViolationType } from "./validation-report.types"

export interface MtblsWs3ResponseWrapper {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: any
}

export interface MtblsWs3ContentWrapper {
    task_id: string,
    task_status: string,
    message: string,
    task_result: MtblsWs3ValidationTaskWrapper
}

export interface MtblsWs3ValidationTaskWrapper {
    study_id: string
    duration_in_seconds: number
    message?: Record<string, any>;
    messages?: ValidationReportInterface
}


export interface ValidationReportInterface {
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




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
    description: string // violation definition
    hasMoreViolations: boolean
    totalViolations: number
    identifier: string
    priority: ViolationPriority // will be an enum or custom type
    section: string // will be an enum or custom type
    sourceColumnHeader: string
    sourceColumnIndex: string
    sourceFile: string // this seems ambiguous to me
    title: string
    type: ViolationType // will be an enum or custom type
    values: string[]
    violation: string // description but as it relates to this study
    technique: string // this refers to analytical technique IE LCMS
    overrided: boolean 
    overrideComment: string
}

export interface ValidationPhase {
    validationTime: string,
    taskId: string
}

export interface OverrideResponse {
    studyId: string,
    validationVersion: string
    validationOverrides: FullOverride[]
}


export interface Breakdown {
    warnings: number;
    errors: number;
}

// we should eventually do some proper schemas WS3 side in order to stop using snake case here
export interface BaseOverride {
    enabled: boolean,
    rule_id: string,
    new_type: ViolationType,
    curator: string,
    comment: string,
    source_file: string,
    source_column_header: string,
    source_column_index: string
}

export interface FullOverride extends BaseOverride {
    override_id: string,
    title: string,
    description: string,
    old_type: ViolationType,
    created_at: string,
    modified_at: string
}

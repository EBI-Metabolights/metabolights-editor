import { ViolationPriority, ViolationType } from "./validation-report.types"

export interface Ws3Response<T> {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: T
}

export interface ValidationHistoryRecord {
    validationTime: string,
    taskId: string
}
export interface PaginatedData<T> {
  data: T[]
  offset: number
  size: number
}
export interface Ws3HistoryResponse {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: PaginatedData<ValidationHistoryRecord>
}


export interface Ws3ValidationTask {
    taskId: string,
    taskStatus: string,
    message: string,
    ready: boolean,
    isSuccessful: boolean
}

export interface ModifierMetadataFileUpdate {
  action: string;
  source: string;
  oldValue: string;
  newValue: string
}

export interface Ws3ValidationReport {
    resourceId: string;
    status: ViolationType;
    durationInSeconds: number;
    startTime: string;
    completionTime: string;
    message?: Record<string, any>;
    messages?: ValidationReportContents;
    assayFileTechniques: Record<string, any>;
    mafFileTechniques: Record<string, any>;
    metadataUpdates: ModifierMetadataFileUpdate[];
    metadataModifierEnabled: boolean;
    validation_overrides: Record<string, any>; //TODO:  type this properly

}
export interface Ws3ValidationTaskSummary {
    task: Ws3ValidationTask,
    taskResult: Ws3ValidationReport
}

export interface Ws3ValidationTaskResponse {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: Ws3ValidationTaskSummary
}

export interface Ws3ValidationTaskInitiationResponse {
    status: string
    successMessage: string
    errorMessage: string
    errors: any[]
    content: Ws3ValidationTaskSummary
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
    sourceFile: string // points to metadata file causes violation ( if violation is not related to a file, its value empty or 'input')
    title: string
    type: ViolationType // will be an enum or custom type
    values: string[]
    violation: string // description but as it relates to this study
    technique: string // this refers to analytical technique IE LCMS
    overridden: boolean
    overrideComment: string
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
    overrideId: string,
    enabled: boolean,
    ruleId: string,
    newType: ViolationType,
    curator: string,
    comment: string,
    sourceFile: string,
    sourceColumnHeader: string,
    sourceColumnIndex: string
}

export interface FullOverride extends BaseOverride {
    title: string,
    description: string,
    oldType: ViolationType,
    createdAt: string,
    modifiedAt: string
}

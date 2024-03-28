export interface ValidationReport {
    summary: Violation[]
    violations: Violation[]
}

export interface Violation {
    description: string
    hasMoreViolations: boolean
    identifier: string
    priority: string // will be an enum or custom type
    section: string // will be an enum or custom type
    sourceColumnHeader: string
    sourceColumnIndex: string
    sourceFile: string // this seems ambiguous to me
    title: string
    type: string // will be an enum or custom type
    values: string[]
    violation: string
}

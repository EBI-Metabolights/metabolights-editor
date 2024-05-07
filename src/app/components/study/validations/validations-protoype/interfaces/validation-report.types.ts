export type ValidationReportSection = "input" | "investigation" | "assay" | "assignment" | "sample" | "files"
export const validationReportSections: ValidationReportSection[] = [
  "input",
  "investigation",
  "assay",
  "assignment",
  "sample",
  "files"
];

export type ValidationReportAssaySubsection = "columns" | "rows" | "general" | "metabolite_identification" | "mass_spectrometry" | "nmr_assay" | "data_transformation"
export type ValidationReportInputSubsection = "parserMessages"
export type ValidationReportInvestigationSubsection = "ontologySourceReferences" | "investigation" | "studies" | "studyDesignDescriptors" | "studyPublications" | "studyFactors" | "studyAssays" | "studyProtocols" | "studyContacts" 
export type ValidationReportSamplesSubsection = "columns" | "rows" | "filename" | "general" | "source" | "sampleCollection"
export type ValidationReportAssignmentSubsection = "general" | "lcms" | "nmr"
export type ValidationReportFilesSubsection = "general"

export type ViolationType = "WARNING" | "ERROR" | "SUCCESS" | "INFO"
export type ViolationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
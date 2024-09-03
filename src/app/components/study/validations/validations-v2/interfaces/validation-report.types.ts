export type ValidationReportSection = "input" | "investigation" | "assay" | "assignment" | "sample" | "files"
export const validationReportSections: ValidationReportSection[] = [
  "input",
  "investigation",
  "assay",
  "assignment",
  "sample",
  "files"
];

// Eventually these types and their derived lists should be replaced with some functionality, maybe in the state, that creates the types and lists dynamically.

export type ValidationReportAssaySubsection = "columns" | "rows" | "general" | "metabolite_identification" | "mass_spectrometry" | "nmr_assay" | "data_transformation"
export type ValidationReportInputSubsection = "parserMessages"
export type ValidationReportInvestigationSubsection = "ontologySourceReferences" | "investigation" | "studies" | "studyDesignDescriptors" | "studyPublications" | "studyFactors" | "studyAssays" | "studyProtocols" | "studyContacts" 
export type ValidationReportSamplesSubsection = "columns" | "rows" | "filename" | "general" | "source" | "sampleCollection"
export type ValidationReportAssignmentSubsection = "general" | "lcms" | "nmr"
export type ValidationReportFilesSubsection = "general"

export type ValidationReportSubsection = 
  | ValidationReportAssaySubsection
  | ValidationReportInputSubsection
  | ValidationReportInvestigationSubsection
  | ValidationReportSamplesSubsection
  | ValidationReportAssignmentSubsection
  | ValidationReportFilesSubsection;

export type ViolationType = "WARNING" | "ERROR" | "SUCCESS" | "INFO"
export type ViolationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export const validationReportAssaySubsectionList: ValidationReportAssaySubsection[] = [
  "columns",
  "rows",
  "general",
  "metabolite_identification",
  "mass_spectrometry",
  "nmr_assay",
  "data_transformation"
];

export const validationReportInputSubsectionList: ValidationReportInputSubsection[] = [
  "parserMessages"
]

export const validationReportInvestigationSubsectionList: ValidationReportInvestigationSubsection[] = [
  "ontologySourceReferences", 
  "investigation", 
  "studies", 
  "studyDesignDescriptors", 
  "studyPublications", 
  "studyFactors", 
  "studyAssays", 
  "studyProtocols", 
  "studyContacts"
];

export const validationReportSamplesSubsectionList: ValidationReportSamplesSubsection[] = [
  "columns",
  "rows",
  "filename",
  "general",
  "source",
  "sampleCollection"
];

export const validationReportAssignmentSubsectionList: ValidationReportAssignmentSubsection[] = [
  "general",
  "lcms",
  "nmr"
]

export const validationReportFilesSubsectionList: ValidationReportFilesSubsection[] = [
  "general"
]
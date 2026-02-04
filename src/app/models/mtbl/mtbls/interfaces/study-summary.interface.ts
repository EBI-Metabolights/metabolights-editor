import { IsaInvestigation } from "./isa-investigation.interface";
/* eslint-disable @typescript-eslint/naming-convention */
/*Interface to represent a study summary*/
export interface IStudySummary {
  isaInvestigation: IsaInvestigation;
  mtblsStudy: IMtblsStudySummaryInformation;
  validation: IValidationStudySummaryInformation;
}

/*Interface to represent the minute study information returned by our IsaInvestigation endpoint*/
export interface IMtblsStudySummaryInformation {
  studyStatus: string;
  curationRequest: string;
  modifiedTime: string;
  statusUpdateTime: string;
  read_access: boolean;
  is_curator: boolean;
  write_access: boolean;
  reviewerLink: string;
  revisionNumber: number;
  revisionDatetime: string;
  revisionStatus: number;
  revisionComment: string;
  revisionTaskMessage: string;
  studyHttpUrl: string;
  studyFtpUrl: string;
  studyGlobusUrl: string;
  studyAsperaPath: string;
  firstPrivateDate: string;
  firstPublicDate: string;
  sampleTemplate: string;
  templateVersion: string;
  studyCategory: string;
  createdAt: string;
  datasetLicense: string;
  datasetLicenseUrl: string;
  mhdAccession?: string;
}

export class IStudyRevision {
    accession_number: string;
    revision_number: number;
    revision_datetime: string;
    revision_comment: string;
    created_by: string;
    status: number;
    task_started_at: string;
    task_completed_at: string;
    task_message: string;
}
/*Interface to represent the small amount of validation informations we get back from the IsaInvestigation endpoint*/
export interface IValidationStudySummaryInformation {
  errors: any[];
  warnings: any[];
}

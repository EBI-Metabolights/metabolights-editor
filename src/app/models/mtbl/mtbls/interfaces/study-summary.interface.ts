import { IsaInvestigation } from "./isa-investigation.interface";

/*Interface to represent a study summary*/
export interface IStudySummary {
    isaInvestigation: IsaInvestigation;
    mtblsStudy: IMtblsStudySummaryInformation;
    validation: IValidationStudySummaryInformation;
}

/*Interface to represent the minute study information returned by our IsaInvestigation endpoint*/
export interface IMtblsStudySummaryInformation {
    studyStatus: string;
    read_access: boolean;
    is_curator: boolean;
    write_access: boolean;
}

/*Interface to represent the small amount of validation informations we get back from the IsaInvestigation endpoint*/
export interface IValidationStudySummaryInformation {
    errors: any[];
    warnings: any[];
}
/* eslint-disable @typescript-eslint/naming-convention */
export interface IValidationSummaryWrapper {
  validation: IValidationSummary;
}

export interface IValidationSummary {
  status: string;
  timing: number;
  last_update_time: string;
  last_update_timestamp: number;
  validations: IValidationSection[];
}

export interface IValidationSection {
  section: string;
  details?: any[]; // this needs changing to a strong type once the validation refactor has been completed.
  message: string;
  status: string;
}

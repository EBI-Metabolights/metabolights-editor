export interface IStudyDetail {
  accession: string;
  updated: string;
  releaseDate: string;
  createdDate: string;
  status: string;
  title: string;
  description: string;
  curationRequest: string;
  revisionStatus: number;
  revisionNumber: number;
  revisionDatetime: string;
  studyCategory?: string;
  sampleTemplate?: string;
  mhdAccession?: string;
}

export interface IStudyDetailWrapper {
  data: IStudyDetail[];
}

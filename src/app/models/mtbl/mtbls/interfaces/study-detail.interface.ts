export interface IStudyDetail {
  accession: string;
  updated: string;
  releaseDate: string;
  createdDate: string;
  status: string;
  title: string;
  description: string;
  curationRequest: string;
}

export interface IStudyDetailWrapper {
  data: IStudyDetail[];
}

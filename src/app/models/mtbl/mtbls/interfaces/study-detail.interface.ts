export interface IStudyDetail {
  accession: string;
  updated: string;
  releaseDate: string;
  createdDate: string;
  status: string;
  title: string;
  description: string;
}

export interface IStudyDetailWrapper {
  data: IStudyDetail[];
}

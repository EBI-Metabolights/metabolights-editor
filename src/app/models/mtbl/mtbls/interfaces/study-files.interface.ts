export interface IStudyFiles {
  study: string[];
  latest: StudyFile[];
  private: StudyFile[];
  uploadPath: string;
  obfuscationCode: string;
}

export interface StudyFile {
  file: string;
  createdAt: string;
  timestamp: string;
  type: string;
  status: string;
  folder: string;
}

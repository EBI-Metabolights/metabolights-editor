export interface IStudyFiles {
  study: StudyFile[];
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
  directory: boolean;
  files: StudyFile[];
  file_difference: string;
}

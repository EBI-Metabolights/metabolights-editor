import { select } from "@angular-redux/store";
import { RedirectURL } from "./globals";

/* eslint-disable @typescript-eslint/naming-convention */
export class MockEditorService {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.validations) studyValidations;
  @select((state) => state.study.files) studyFiles;

  redirectUrl: string = RedirectURL;
  currentStudyIdentifier: string = null;
  validations: any = {};
  files: any = [];
  samples_columns_order: any = {
    "Sample Name": 1,
    "Characteristics[Organism]": 2,
    "Characteristics[Organism part]": 3,
    "Characteristics[Variant]": 4,
    "Characteristics[Sample type]": 5,
    "Protocol REF": 6,
    "Source Name": 7,
  };

  refreshValidations() {
    return { success: "Validation Schema File updated" };
  }

  loadValidations() {
    return null;
  }

  addComment(data) {
    return null;
  }

  overrideValidations(data) {
    return { success: "Validation 'val' stored in the database" };
  }

  initialiseStudy(route) {
    return null;
  }

  loadGuides() {
    return null;
  }

  getStudyPrivateFolderAccess() {
    return {
      access: "Write",
    };
  }

  toggleFolderAccess() {
    return {
      access: "Write",
    };
  }
}

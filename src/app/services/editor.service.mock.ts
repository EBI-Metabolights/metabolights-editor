import { select } from "@angular-redux/store";
import { Select } from "@ngxs/store";
import { GeneralMetadataState } from "../ngxs-store/study/general-metadata/general-metadata.state";
import { Observable } from "rxjs";
import { FilesState } from "../ngxs-store/study/files/files.state";
import { IStudyFiles } from "../models/mtbl/mtbls/interfaces/study-files.interface";
import { ValidationState } from "../ngxs-store/study/validation/validation.state";

/* eslint-disable @typescript-eslint/naming-convention */
export class MockEditorService {
  @select((state) => state.study.identifier) studyIdentifier;
  @select((state) => state.study.validations) studyValidations;
  @select((state) => state.study.files) studyFiles;

  @Select(GeneralMetadataState.id) studyIdentifier$: Observable<string>
  @Select(FilesState.files) studyFiles$: Observable<IStudyFiles>;
  @Select(ValidationState.rules) editorValidationRules$: Observable<Record<string, any>>;



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

  loadStudyFiles() {
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

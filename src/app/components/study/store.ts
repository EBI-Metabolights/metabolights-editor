import { tassign } from "tassign";
import { MTBLSStudy } from "../../models/mtbl/mtbls/mtbls-study";
import { MTBLSProtocol } from "../../models/mtbl/mtbls/mtbls-protocol";
import { MTBLSFactor } from "../../models/mtbl/mtbls/mtbls-factor";
import { Ontology } from "../../models/mtbl/mtbls/common/mtbls-ontology";
import { MTBLSProcessSequence } from "../../models/mtbl/mtbls/mtbls-process-sequence";
import { JsonConvert } from "json2typescript";
import {
  SET_STUDY_IDENTIFIER,
  SET_STUDY_TITLE,
  SET_STUDY_ABSTRACT,
  SET_STUDY_DESIGN_DESCRIPTORS,
  UPDATE_STUDY_DESIGN_DESCRIPTORS,
  SET_STUDY_SUBMISSION_DATE,
  SET_STUDY_RELEASE_DATE,
  SET_STUDY_STATUS,
  SET_STUDY_CURATION_REQUEST,
  SET_STUDY_REVIEWER_LINK,
  SET_STUDY_ASSAYS,
  SET_STUDY_PUBLICATIONS,
  SET_STUDY_PEOPLE,
  SET_STUDY_FACTORS,
  SET_STUDY_ORGANISMS,
  SET_STUDY_PROTOCOLS,
  SET_STUDY_SAMPLES,
  ADD_STUDY_ASSAY,
  SET_STUDY_PROCESS_SEQUENCE,
  UPDATE_STUDY_PEOPLE,
  UPDATE_STUDY_PUBLICATIONS,
  UPDATE_STUDY_PROTOCOLS,
  UPDATE_STUDY_FACTORS,
  ADD_STUDY_PROCESS_SEQUENCE,
  ADD_MAF,
  UPDATE_MAF_DATA,
  SET_UPLOAD_LOCATION,
  SET_OBFUSCATION_CODE,
  ADD_STUDY_ASSAY_TABLE,
  LOAD_VALIDATION_RULES,
  SET_STUDY_VALIDATION,
  SET_STUDY_ASSAY,
  SET_STUDY_FILES,
  DELETE_STUDY_ASSAY,
  SET_STUDY_MAF,
  SET_STUDY_ERROR,
  SET_STUDY_READONLY,
  SET_PROTOCOL_EXPAND,
} from "./actions";
/* eslint-disable prefer-arrow/prefer-arrow-functions */

export const STUDY_INITIAL_STATE: MTBLSStudy = new MTBLSStudy();

function checkLocal() {
  return localStorage.getItem("state") === null
    ? STUDY_INITIAL_STATE
    : JSON.parse(localStorage.getItem("state")).study;
}

function setStudyIdentifier(state, action) {
  if (action.body.study) {
    if (
      action.body.study.isaInvestigation &&
      action.body.study.isaInvestigation.studies[0].identifier
    ) {
      return tassign(state, {
        identifier: action.body.study.isaInvestigation.studies[0].identifier,
        assays: {},
        samples: {},
        protocols: [],
        mafs: [],
      });
    }
    return tassign(state, {
      identifier: action.body.study,
      assays: {},
      samples: {},
      protocols: [],
      mafs: [],
    });
  } else {
    return tassign(state, {
      identifier: action.body.study,
      assays: {},
      samples: {},
      protocols: [],
      mafs: [],
    });
  }
}

function setStudyReadOnly(state, action) {
  return tassign(state, { readonly: action.body.readonly });
}

function setStudyTitle(state, action) {
  return tassign(state, { title: action.body.title });
}

function setStudyAbstract(state, action) {
  return tassign(state, { abstract: action.body.description });
}

function setStudySubmissionDate(state, action) {
  return tassign(state, {
    submissionDate:
      action.body.study.isaInvestigation.studies[0].submissionDate,
  });
}

function setStudyReleaseDate(state, action) {
  return tassign(state, {
    releaseDate:
      action.body.study.isaInvestigation.studies[0].publicReleaseDate,
  });
}

function setStudyStatus(state, action) {
  return tassign(state, { status: action.body.study.mtblsStudy.studyStatus });
}

function setCurationRequest(state, action) {
  return tassign(state, { curationRequest: action.body.study.mtblsStudy.curationRequest });
}

function setStudyReviewerLink(state, action) {
  return tassign(state, {
    reviewerLink: action.body.study.mtblsStudy.reviewer_link,
  });
}

function setStudyPublications(state, action) {
  return tassign(state, {
    publications: action.body.study.isaInvestigation.studies[0].publications,
  });
}

function setStudyAssays(state, action) {
  return tassign(state, {
    studyAssays: action.body.study.isaInvestigation.studies[0].assays,
  });
}

function updateStudyPublications(state, action) {
  return tassign(state, { publications: action.body.publications });
}

function setStudyPeople(state, action) {
  if (action.body.study.isaInvestigation.studies[0].people) {
    return tassign(state, {
      people: action.body.study.isaInvestigation.studies[0].people,
    });
  } else {
    // return tassign(state, { people: action.body.study.isaInvestigation.studies[0].people });
  }
}

function setStudyDesignDescriptors(state, action) {
  const designDescriptors = [];
  const jsonConvert: JsonConvert = new JsonConvert();
  action.body.studyDesignDescriptors.forEach((descriptor) => {
    designDescriptors.push(jsonConvert.deserialize(descriptor, Ontology));
  });
  return tassign(state, { studyDesignDescriptors: designDescriptors });
}

function updateStudyPeople(state, action) {
  return tassign(state, { people: action.body.people });
}

function loadValidationRules(state, action) {
  return tassign(state, { validations: action.body.validations.study });
}

function setStudyFactors(state, action) {
  const studyFactors = [];
  const jsonConvert: JsonConvert = new JsonConvert();
  action.body.factors.forEach((protocol) => {
    studyFactors.push(jsonConvert.deserialize(protocol, MTBLSFactor));
  });
  return tassign(state, { factors: studyFactors });
}

function setStudyProtocols(state, action) {
  const studyProtocols = [];
  const jsonConvert: JsonConvert = new JsonConvert();
  action.body.protocols.forEach((protocol) => {
    studyProtocols.push(jsonConvert.deserialize(protocol, MTBLSProtocol));
  });
  return tassign(state, { protocols: studyProtocols });
}

function setStudySamples(state, action) {
  return tassign(state, { samples: action.body });
}

function setStudyProcessSequence(state, action) {
  const studyProcessSequences = [];
  const jsonConvert: JsonConvert = new JsonConvert();
  action.body.processSequence.forEach((process) => {
    studyProcessSequences.push(
      jsonConvert.deserialize(process, MTBLSProcessSequence)
    );
  });
  return tassign(state, { processSequence: studyProcessSequences });
}

function addStudyAssay(state, action) {
  const jsonConvert: JsonConvert = new JsonConvert();
  return tassign(state, { assays: state.assays.concat(action.body.assay) });
}

function addStudyAssayTable(state, action) {
  const studyProtocols = [];
  const tempAssayTables = Object.assign({}, state.assayTables);
  tempAssayTables[action.body.assay] = action.body.assayTable;
  state.protocols.forEach((protocol) => {
    Object.keys(action.body.assayTable.protocolsMetaData).forEach((key) => {
      if (
        action.body.assayTable.protocolsMetaData[key].values.indexOf(
          protocol.name
        ) > -1
      ) {
        const protocolValidation = state.validations.protocols.default.filter(
          (p) => p.title === protocol.name
        )[0];
        protocol.meta[action.body.assay] =
          action.body.assayTable.protocolsMetaData[key].columns;
        protocol.meta[action.body.assay].forEach((column) => {
          if (protocolValidation.columns[column.name]) {
            column["is-hidden"] = JSON.parse(
              protocolValidation.columns[column.name]["is-hidden"]
            );
          }
        });
      }
    });
    studyProtocols.push(Object.assign({}, protocol));
  });
  return tassign(state, {
    assayTables: tempAssayTables,
    protocols: studyProtocols,
  });
}

function setStudyAssay(state, action) {
  const tempAssays = Object.assign({}, state.assays);
  const currentAssay = action.body;
  tempAssays[currentAssay.name] = action.body;
  return tassign(state, { assays: tempAssays });
}

function deleteStudyAssay(state, action) {
  const tempAssays = Object.assign({}, state.assays);
  const tempMAFS = Object.assign({}, state.mafs);
  tempAssays[action.body].mafs.forEach((maf) => {
    delete tempMAFS[maf];
  });
  delete tempAssays[action.body];
  return tassign(state, { assays: tempAssays, mafs: tempMAFS });
}

function setStudyMAF(state, action) {
  const tempMAFS = Object.assign({}, state.mafs);
  tempMAFS[action.body.data.file] = action.body;
  return tassign(state, { mafs: tempMAFS });
}

function addMAF(state, action) {
  const tempList = [];
  if (state.metaboliteAnnotationFiles.length > 0) {
    let present = false;
    state.metaboliteAnnotationFiles.forEach((maf) => {
      if (
        maf.file === action.body.maf.file &&
        maf.assay === action.body.maf.assay
      ) {
        present = true;
        tempList.push(action.body.maf);
      } else {
        tempList.push(maf);
      }
    });
    if (!present) {
      tempList.push(action.body.maf);
    }
  } else {
    tempList.push(action.body.maf);
  }
  return tassign(state, { metaboliteAnnotationFiles: tempList });
}

function updateMAF(state, action) {
  let index = null;
  if (state.metaboliteAnnotationFiles) {
    let i = 0;
    state.metaboliteAnnotationFiles.forEach((f) => {
      if (f === action.body.maf.file && f.assay === action.body.maf.assay) {
        index = i;
      }
      i = i + 1;
    });
  }
  if (index !== null) {
    state.metaboliteAnnotationFiles[index] = action.body.maf;
  }
  return tassign(state, {
    metaboliteAnnotationFiles: state.metaboliteAnnotationFiles,
  });
}

function setProtocolExpand(state, action) {
  return tassign(state, { isProtocolsExpanded: !action.body });
}

function addStudyProcessSequence(state, action) {
  return tassign(state, {
    processSequence: state.processSequence.concat(action.body.processSequence),
  });
}

function setStudyFiles(state, action) {
  return tassign(state, { files: action.body });
}

function setStudyOrganisms(state, action) {
  return tassign(state, { organisms: action.body.organisms });
}

function setStudyValidation(state, action) {
  return tassign(state, { validation: action.body.validation });
}

function setUploadLocation(state, action) {
  return tassign(state, { uploadLocation: action.body.uploadLocation });
}

function setObfuscationCode(state, action) {
  return tassign(state, { obfuscationCode: action.body.obfuscationCode });
}

function setStudyInvestigationFailedError(state, action) {
  return tassign(state, {
    investigationFailed: action.body.investigationFailed,
  });
}

export function studyReducer(
  state: MTBLSStudy = checkLocal(),
  action
): MTBLSStudy {
  switch (action.type) {
    case SET_STUDY_IDENTIFIER:
      return setStudyIdentifier(state, action);
    case SET_STUDY_TITLE:
      return setStudyTitle(state, action);
    case SET_STUDY_ABSTRACT:
      return setStudyAbstract(state, action);
    case SET_STUDY_STATUS:
      return setStudyStatus(state, action);
    case SET_STUDY_CURATION_REQUEST:
      return setCurationRequest(state, action);
    case SET_STUDY_REVIEWER_LINK:
      return setStudyReviewerLink(state, action);

    case SET_STUDY_SUBMISSION_DATE:
      return setStudySubmissionDate(state, action);
    case SET_STUDY_RELEASE_DATE:
      return setStudyReleaseDate(state, action);

    case SET_STUDY_PUBLICATIONS:
      return setStudyPublications(state, action);
    case SET_STUDY_ASSAYS:
      return setStudyAssays(state, action);
    case UPDATE_STUDY_PUBLICATIONS:
      return updateStudyPublications(state, action);

    case SET_STUDY_PEOPLE:
      return setStudyPeople(state, action);
    case UPDATE_STUDY_PEOPLE:
      return updateStudyPeople(state, action);

    case LOAD_VALIDATION_RULES:
      return loadValidationRules(state, action);

    case SET_STUDY_DESIGN_DESCRIPTORS:
      return setStudyDesignDescriptors(state, action);
    case UPDATE_STUDY_DESIGN_DESCRIPTORS:
      return setStudyDesignDescriptors(state, action);

    case SET_STUDY_FACTORS:
      return setStudyFactors(state, action);
    case SET_STUDY_ORGANISMS:
      return setStudyOrganisms(state, action);

    case SET_STUDY_PROTOCOLS:
      return setStudyProtocols(state, action);
    case UPDATE_STUDY_PROTOCOLS:
      return setStudyProtocols(state, action);

    case UPDATE_STUDY_FACTORS:
      return setStudyFactors(state, action);
    case SET_STUDY_SAMPLES:
      return setStudySamples(state, action);
    case SET_STUDY_PROCESS_SEQUENCE:
      return setStudyProcessSequence(state, action);
    case ADD_STUDY_PROCESS_SEQUENCE:
      return addStudyProcessSequence(state, action);

    case ADD_STUDY_ASSAY:
      return addStudyAssay(state, action);
    case ADD_MAF:
      return addMAF(state, action);
    case UPDATE_MAF_DATA:
      return updateMAF(state, action);
    case ADD_STUDY_ASSAY_TABLE:
      return addStudyAssayTable(state, action);

    case SET_UPLOAD_LOCATION:
      return setUploadLocation(state, action);
    case SET_OBFUSCATION_CODE:
      return setObfuscationCode(state, action);
    case SET_STUDY_VALIDATION:
      return setStudyValidation(state, action);

    case SET_STUDY_FILES:
      return setStudyFiles(state, action);
    case SET_STUDY_ASSAY:
      return setStudyAssay(state, action);
    case DELETE_STUDY_ASSAY:
      return deleteStudyAssay(state, action);

    case SET_STUDY_MAF:
      return setStudyMAF(state, action);

    case SET_STUDY_ERROR:
      return setStudyInvestigationFailedError(state, action);

    case SET_PROTOCOL_EXPAND:
      return setProtocolExpand(state, action);

    case SET_STUDY_READONLY:
      return setStudyReadOnly(state, action);
  }

  return state;
}

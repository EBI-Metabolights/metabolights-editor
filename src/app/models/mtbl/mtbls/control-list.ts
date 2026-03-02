/* tslint:disable */
/* eslint-disable */

export type IsaTabFileType = "assay" | "sample" | "investigation" | "maf";
export type StudyCategoryStr = "other" | "ms-mhd-enabled" | "ms-imaging" | "ms-other" | "nmr" | "ms-mhd-legacy";
export type EnforcementLevel = "required" | "recommended" | "optional";
/**
 * Validation rule type
 */
export type ValidationType =
  | "any-ontology-term"
  | "child-ontology-term"
  | "ontology-term-in-selected-ontologies"
  | "selected-ontology-term";

export interface AdditionalSource {
  /**
   * Source label. e.g., ILX, wikidata, etc.
   */
  sourceLabel: string;
  /**
   * Prefix for the values from source. e.g., https://www.wikidata.org/wiki/, http://uri.interlex.org/base/ilx_
   */
  accessionPrefix: string;
}
export interface FieldSelector {
  /**
   * Node name. e.g., Sample Name, Source Name, Protocol REF
   */
  name: string;
  /**
   * Node value to find . e.g. Protocol REF with value 'Sample collection'
   */
  value: string | null;
}
/**
 * Field selection criteria
 */
export interface SelectionCriteria {
  isaFileType: IsaTabFileType;
  /**
   * Filter to select studies created after the defined date.
   */
  studyCreatedAtOrAfter: string | null;
  /**
   * Filter to select studies created before the defined date.
   */
  studyCreatedBefore: string | null;
  /**
   * Filter to select studies with the defined category
   */
  studyCategoryFilter: StudyCategoryStr[] | null;
  /**
   * Filter to select studies with the defined template version
   */
  templateVersionFilter: string[] | null;
  /**
   * Filter to select ISA-TAB file template. LC-MS, GC-MS, etc. for assay, minimum, clinical, etc. for sample
   */
  isaFileTemplateNameFilter: string[] | null;
  /**
   * Filter by linked field and its value. Current rule will be selected if the field is an attribute of ISA-TAB node (Sample Name, Source Name, Protocol REF).Characteristics can be linked to Sample Name or Source Name. Parameter Value can be linked to Protocol REF with value. e.g., {name: 'Protocol REF', 'value': 'Mass spectrometry'}, Units can be linked to Parameter Value, Factor Value and Characteristic fields.Comments can be linked to ISA-TAB nodes (Sample Name, Source Name, Protocol REF, etc.)
   */
  linkedFieldAndValueFilter: FieldSelector[] | null;
}
export interface OntologyTerm {
  /**
   * Ontology term
   */
  term: string;
  /**
   * The accession number from the Term Source associated with the term.
   */
  termAccessionNumber: string;
  /**
   * Source reference name of ontology term. e.g., EFO, OBO.
   */
  termSourceRef: string;
}
export interface OntologyTermPlaceholder {
  /**
   * The accession number of placeholder.
   */
  termAccessionNumber: string;
  /**
   * Source reference name of placeholder. e.g., MTBLS.
   */
  termSourceRef: string;
}
export interface ParentOntologyTerms {
  /**
   * Label match regex patterns to filter ontology terms.
   */
  excludeByLabelPattern: string[] | null;
  /**
   * Accession numbers of the excluded ontology terms.
   */
  excludeByAccession: string[] | null;
  /**
   * List of parent ontology terms
   */
  parents: OntologyTerm[];
}

export interface FieldValueValidation {
  /**
   * Unique name id for the the field. Rule naming convention is <Field name>-<incremental number>. e.g., Parameter Value[Instrument]-01, Parameter Value[Instrument]-02
   */
  ruleName: string;
  /**
   * Definition of rule and summary of selection criteria.
   */
  description: string;
  /**
   * Name of the column header or investigation field name. e.g., Parameter Value[Instrument], Study Assay Measurement Type.
   */
  fieldName: string;
  selectionCriteria: SelectionCriteria;
  validationType: ValidationType;
  termEnforcementLevel: EnforcementLevel;
  unexpectedTermEnforcementLevel: EnforcementLevel;
  /**
   * Default ontology term
   */
  defaultValue: OntologyTerm | null;
  /**
   * Allowed missing ontology terms
   */
  allowedMissingOntologyTerms: OntologyTerm[] | null;
  /**
   * Allowed values from other non ontology sources.
   */
  allowedOtherSources: AdditionalSource[] | null;
  /**
   * Allowed placeholders for term source and accession
   */
  allowedPlaceholders: OntologyTermPlaceholder[] | null;
  /**
   * Selected ontology terms. If validation type is selected-ontology-term, it defines ordered allowed ontology terms, otherwise it lists ordered and recommended ontology terms.
   */
  terms: OntologyTerm[] | null;
  /**
   * Ordered ontology source references. If validation type is ontology-term-in-selected-ontologies, it defines ontology sources, otherwise it lists recommended ontology sources.
   */
  ontologies: string[] | null;
  /**
   * Parent ontology terms to find the allowed child ontology terms. Applicable only for validation type child-ontology-term
   */
  allowedParentOntologyTerms: ParentOntologyTerms | null;

  unexpectedTerms: string[] | null;
}

export interface ControlListTerm {
  definition: string
  iri: string,
  name: string,
  ontoName: string,
  provenanceName: string,
  provenanceUri: string,
  zoomaConfidence: string
}

export interface MetabolightsFieldControls {
  // Updated to match JSON nesting: controlLists.controls.{type}FileControls
  controlLists: {
    controls: {
      assayFileControls?: {
        [k: string]: FieldValueValidation[];
      };
      sampleFileControls?: {
        [k: string]: FieldValueValidation[];
      };
      investigationFileControls?: {
        [k: string]: FieldValueValidation[];
      };
      assignmentFileControls?: {
        [k: string]: FieldValueValidation[];
      };
    };
    // Legacy flat control lists (key -> array of ControlListTerm) for fallback
    [k: string]: ControlListTerm[] | any;
    defaultOntologies?: string[];
    defaultOtherSources?: string[];
    defaultFactorValueOntologies?: string[];
  };
}

export interface ValidationRuleSelectionInput {
  studyCategory: StudyCategoryStr,
  studyCreatedAt: Date,
  isaFileType: string,
  isaFileTemplateName: string,
  templateVersion: string,
  // Optional: Add linked fields if needed for advanced filtering
  linkedFields?: Map<string, string>;
}

/**
 * Selects a validation rule based on selection criteria and study metadata
 * @param rules Array of validation rules to select from
 * @param criteria Study metadata for rule selection
 * @returns The first matching validation rule or null if no match found
 */
function selectValidationRule(
    rules: FieldValueValidation[],
    ruleSelectionInput: ValidationRuleSelectionInput
): FieldValueValidation | null {

    for (const rule of rules) {
        const selectionCriteria = rule.selectionCriteria;

       // Normalize possible date inputs (string | Date | null) to 'YYYY-MM-DD' strings for safe lexical comparison.
        const normalizeToISODate = (d: string | Date | null | undefined): string | null => {
            if (!d) return null;
            const dt = typeof d === "string" ? new Date(d) : d;
            if (!dt || isNaN((dt as Date).getTime())) return null;
            return (dt as Date).toISOString().slice(0, 10); // YYYY-MM-DD
        };

        const studyCreatedAtStr = normalizeToISODate(ruleSelectionInput.studyCreatedAt as any);
        const afterStr = normalizeToISODate(selectionCriteria.studyCreatedAtOrAfter as any);
        const beforeStr = normalizeToISODate(selectionCriteria.studyCreatedBefore as any);

        const afterMatches =
            !selectionCriteria.studyCreatedAtOrAfter ||
            (studyCreatedAtStr !== null && afterStr !== null && studyCreatedAtStr >= afterStr);
        const beforeMatches =
            !selectionCriteria.studyCreatedBefore ||
            (studyCreatedAtStr !== null && beforeStr !== null && studyCreatedAtStr < beforeStr);
        // If a criteria is null/undefined, consider it as matching (true)
        // Point 4: If an input property in ruleSelectionInput is null/undefined, consider it as matching the filter
        const matches = [
            // Study category check: if input is null, it matches any category filter
            !selectionCriteria.studyCategoryFilter ||
            !ruleSelectionInput.studyCategory ||
            selectionCriteria.studyCategoryFilter.includes(ruleSelectionInput.studyCategory),

            // Creation date range checks (use afterMatches/beforeMatches)
            afterMatches,
            beforeMatches,

            // // Template version check: if input is null, it matches any version filter
            !selectionCriteria.templateVersionFilter ||
            !ruleSelectionInput.templateVersion ||
            selectionCriteria.templateVersionFilter.includes(ruleSelectionInput.templateVersion),

            // // ISA file type check
            !selectionCriteria.isaFileType ||
            selectionCriteria.isaFileType === ruleSelectionInput.isaFileType,

            // // ISA file template check: if input is null, it matches any template filter
            !selectionCriteria.isaFileTemplateNameFilter ||
            !ruleSelectionInput.isaFileTemplateName ||
            selectionCriteria.isaFileTemplateNameFilter.includes(ruleSelectionInput.isaFileTemplateName),

            // Linked fields check (if provided)
            // !selectionCriteria.linkedFieldAndValueFilter ||
            // selectionCriteria.linkedFieldAndValueFilter.every(fieldFilter => {
            //     const fieldValue = ruleSelectionInput.linkedFields?.get(fieldFilter.name);
            //     return fieldValue && (!fieldFilter.value || fieldFilter.value === fieldValue);
            // })
        ].every(Boolean);

        if (matches) {
            return rule;
        }
    }

    return null;
}

/**
 * Lookup validation rule for a given ISA file type and field name inside MetabolightsFieldControls.
 * Returns the first matching rule according to selectValidationRule or null if none found.
 * Updated to access nested controls structure.
 */
export function getValidationRuleForField(
    controls: MetabolightsFieldControls,
    fieldName: string,
    ruleSelectionInput: ValidationRuleSelectionInput
): FieldValueValidation | null {

    let controlsMap: { [k: string]: FieldValueValidation[] } | undefined;
    switch (ruleSelectionInput.isaFileType) {
        case "assay":
            controlsMap = controls.controlLists.controls.assayFileControls;
            break;
        case "sample":
            controlsMap = controls.controlLists.controls.sampleFileControls;
            break;
        case "investigation":
            controlsMap = controls.controlLists.controls.investigationFileControls;
            break;
        case "assignment":
            controlsMap = controls.controlLists.controls.assignmentFileControls;
            break;
        default:
            controlsMap = undefined;
    }

    const rules = controlsMap?.[fieldName] || [];
    if (rules.length === 0) return null;

    return selectValidationRule(rules, ruleSelectionInput);
}

/* template configuration interfaces */
export interface FileTemplates {
  /**
   * ISA-TAB assay file templates
   */
  assayFileHeaderTemplates: {
    [k: string]: IsaTableFileTemplate[];
  };
  /**
   * ISA-TAB assay file templates
   */
  sampleFileHeaderTemplates: {
    [k: string]: IsaTableFileTemplate[];
  };
  /**
   * maf file templates
   */
  assignmentFileHeaderTemplates: {
    [k: string]: IsaTableFileTemplate[];
  };
  /**
   * investigation file templates
   */
  investigationFileTemplates: {
    [k: string]: InvestigationFileTemplate[];
  };
  /**
   * Study protocol templates
   */
  protocolTemplates: {
    [k: string]: StudyProtocolTemplate[];
  };
  /**
   * Ontology source reference templates
   */
  ontologySourceReferenceTemplates: {
    [k: string]: OntologySourceReferenceTemplate;
  };
  configuration: TemplateSettings;
}
export interface IsaTableFileTemplate {
  /**
   * Fixed column count.
   */
  fixedColumnCount: number;
  /**
   * Template name
   */
  description: string;
  /**
   * Template version
   */
  version: string;
  /**
   * ISA-TAB table column definitions
   */
  headers: ColumnDescription[];
}
export interface InvestigationFileTemplate {
  /**
   * Template version
   */
  version: string;
  /**
   * Template name
   */
  description: string;
  /**
   * Investigation file sections
   */
  sections: InvestigationFileSection[];
}
export interface StudyProtocolTemplate {
  /**
   * Template version
   */
  version: string;
  /**
   * Template description
   */
  description: string;
  /**
   * Ordered protocol names
   */
  protocols: string[];
  /**
   * Definition of protocol listed in the `protocols` field
   */
  protocolDefinitions: {
    [k: string]: ProtocolDefinition;
  };
}
export interface OntologySourceReferenceTemplate {
  /**
   * Source name
   */
  sourceName: string;
  /**
   * Source file
   */
  sourceFile: string;
  /**
   * Source version
   */
  sourceVersion: string;
  /**
   * Source full name
   */
  sourceDescription: string;
  /**
   * Source details
   */
  sourceDetails: string;
}
export interface TemplateSettings {
  /**
   * active template versions
   */
  activeTemplateVersions: string[];
  /**
   * default study template version
   */
  defaultTemplateVersion: string;
  /**
   * MetaboLights template versions
   */
  datasetLicenses: {
    [k: string]: LicenseInfo;
  };
  descriptorConfiguration: DescriptorConfiguration;
  /**
   * result file formats
   */
  resultFileFormats: {
    [k: string]: OntologyTerm;
  };
  /**
   * default control lists
   */
  defaultFileControls: {
    [k: string]: DefaultControl[];
  };
  defaultComments: DefaultCommentConfiguration;
  /**
   * study categories
   */
  studyCategories: {
    [k: string]: StudyCategoryDefinition;
  };
  /**
   * MHD profiles and versions
   */
  mhdProfiles: {
    [k: string]: {
      [k: string]: MhdProfileInfo;
    };
  };
  /**
   * MetaboLights template versions
   */
  versions: {
    [k: string]: TemplateConfiguration;
  };
}
export interface ColumnDescription {
  /**
   * column structure
   */
  columnStructure: "SINGLE_COLUMN" | "ONTOLOGY_COLUMN" | "SINGLE_COLUMN_AND_UNIT_ONTOLOGY";
  /**
   * column category
   */
  columnCategory: ("" | "Basic" | "Protocol" | "Parameter" | "Characteristics" | "File" | "Label") | null;
  /**
   * column header
   */
  columnHeader: string;
  /**
   * column prefix
   */
  columnPrefix: string | null;
  /**
   * column prefix
   */
  defaultValue: string | null;
  /**
   * default column index
   */
  defaultColumnIndex: number;
  /**
   * column value minimum length
   */
  minLength: number | null;
  /**
   * column value maximum length
   */
  maxLength: number | null;
  /**
   * column value is required
   */
  required: boolean;
  /**
   * column description
   */
  description: string | null;
  /**
   * column value examples
   */
  examples: string[] | null;
}
export interface InvestigationFileSection {
  /**
   * Section name
   */
  name: string;
  /**
   * Section row prefixes
   */
  fields: string[];
  /**
   * Default comments for the section
   */
  defaultComments: string[];
  /**
   * Default field values
   */
  defaultFieldValues: {
    [k: string]: string | string[] | string[][];
  };
  /**
   * Default comment values
   */
  defaultCommentValues: {
    [k: string]: string | string[] | string[][];
  };
}
export interface ProtocolDefinition {
  /**
   * Name of protocol
   */
  name: string;
  /**
   * Description of protocol
   */
  description: string;
  type: OntologyTerm;
  /**
   * Compact URI presentation (obo_id) of protocol type
   */
  typeCurie: string;
  /**
   * Parameters of protocol
   */
  parameters: string[];
  /**
   * Definition of protocol parameter listed in the `parameters` field
   */
  parameterDefinitions: {
    [k: string]: ProtocolParameterDefinition;
  };
}
export interface LicenseInfo {
  /**
   * license name
   */
  name: string;
  /**
   * license version
   */
  version: string;
  /**
   * license URL
   */
  url: string;
}
export interface DescriptorConfiguration {
  /**
   * default descriptor category
   */
  defaultDescriptorCategory: string;
  /**
   * default submitter source
   */
  defaultSubmitterSource: string;
  /**
   * default data curation source
   */
  defaultDataCurationSource: string;
  /**
   * default workflow source
   */
  defaultWorkflowSource: string;
  /**
   * default descriptor sources
   */
  defaultDescriptorCategories: {
    [k: string]: DescriptorCategoryDefinition;
  };
  /**
   * default descriptor sources
   */
  defaultDescriptorSources: {
    [k: string]: OntologyTerm;
  };
}
export interface DefaultControl {
  /**
   * pattern of column or field
   */
  keyPattern: string;
  /**
   * default key name
   */
  defaultKey: string;
}
export interface DefaultCommentConfiguration {
  studyComments: SectionDefaultComments;
  assayComments: SectionDefaultComments;
  studyDesignDescriptorComments: SectionDefaultComments;
  studyFactorComments: SectionDefaultComments;
  studyProtocolComments: SectionDefaultComments;
  studyPublicationComments: SectionDefaultComments;
  studyContactComments: SectionDefaultComments;
}
export interface StudyCategoryDefinition {
  /**
   * study category index
   */
  index: number;
  /**
   * study category name
   */
  name: string;
  /**
   * study category label
   */
  label: string;
  /**
   * study category description
   */
  description: string;
}
export interface MhdProfileInfo {
  /**
   * File schema URL
   */
  fileSchema: string;
  /**
   * MHD file profile URL
   */
  mhdFileProfile: string;
  /**
   * announcement file profile URL
   */
  announcementFileProfile: string;
}
export interface TemplateConfiguration {
  /**
   * active investigation file templates
   */
  activeInvestigationFileTemplates: string[];
  /**
   * active assignment file templates
   */
  activeAssignmentFileTemplates: string[];
  /**
   * active sample file templates
   */
  activeSampleFileTemplates: string[];
  /**
   * active assay file templates
   */
  activeAssayFileTemplates: string[];
  /**
   * active study categories
   */
  activeStudyCategories: string[];
  /**
   * active dataset licenses
   */
  activeDatasetLicenses: string[];
  /**
   * active dataset licenses
   */
  activeMhdProfiles: {
    [k: string]: ActiveMhdProfile;
  };
  /**
   * active study design descriptor categories
   * We will update it to later: ActiveDesignDescriptorCategory
   */
  activeStudyDesignDescriptorCategories: string[];
  /**
   * active assay design descriptor categories
   * We will update it to later: ActiveDesignDescriptorCategory
   */
  activeAssayDesignDescriptorCategories: string[];
  /**
   * default sample file name
   */
  defaultSampleFileTemplate: string;
  /**
   * default study file name
   */
  defaultInvestigationFileTemplate: string;
  /**
   * default study category
   */
  defaultStudyCategory: string;
  /**
   * default dataset license name
   */
  defaultDatasetLicense: string;
  /**
   * investigation file name
   */
  investigationFileName: string;
  /**
   * derived file extensions
   */
  derivedFileExtensions: string[];
  /**
   * raw file extensions
   */
  rawFileExtensions: string[];
  /**
   * Study category assay file type mappings
   */
  assayFileTypeMappings: {
    [k: string]: string[];
  };
}
export interface ProtocolParameterDefinition {
  /**
   * Definition of protocol parameter.
   */
  definition: string;
  type: OntologyTerm;
  /**
   * Compact URI presentation (obo_id) of protocol parameter type. e.g. MS:1000831, OBI:0001139
   */
  typeCurie: string;
  /**
   * value representation format
   */
  format: "Text" | "Ontology" | "Numeric";
  /**
   * Example protocol parameter values.
   */
  examples: string[];
}
export interface DescriptorCategoryDefinition {
  /**
   * study category name
   */
  name: string;
  /**
   * study category label
   */
  label: string;
  /**
   * study category description
   */
  controlListKey: string | null;
}
export interface SectionDefaultComments {
  /**
   * comment groups in section
   */
  groups: string[];
  /**
   * section comment group definitions
   */
  groupDefinitions: {
    [k: string]: CommentGroupDefinition;
  };
}
export interface ActiveMhdProfile {
  /**
   * profile name
   */
  profileName: string;
  /**
   * default profile version
   */
  defaultVersion: string;
  /**
   * active profile versions
   */
  activeVersions: string[];
}
export interface CommentGroupDefinition {
  /**
   * comment group can be defined multiple
   */
  allowMultiple: boolean;
  /**
   * join operator if group has multiple values
   */
  joinOperator: string | null;
  /**
   * comments in group
   */
  comments: boolean & CommentDescription[];
}
export interface CommentDescription {
  /**
   * Comment name
   */
  name: string;
  /**
   * Comment label
   */
  label: string;
  /**
   * Is the comment an ontology term
   */
  isOntology: boolean;
  /**
   * Comment control list key
   */
  controlListKey: string | null;
}
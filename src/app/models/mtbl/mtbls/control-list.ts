/* tslint:disable */
/* eslint-disable */

export type IsaTabFileType = "assay" | "sample" | "investigation";
export type StudyCategoryStr = "other" | "ms-mhd-enabled" | "ms-imaging" | "ms-other" | "nmr" | "ms-mhd-legacy";
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
        
        // Combine all conditions with AND operator
        // If a criteria is null/undefined, consider it as matching (true)
        const matches = [
            // Study category check
            !selectionCriteria.studyCategoryFilter || 
            selectionCriteria.studyCategoryFilter.includes(ruleSelectionInput.studyCategory),

            // Creation date range check
            (!selectionCriteria.studyCreatedAtOrAfter || 
                ruleSelectionInput.studyCreatedAt >= new Date(selectionCriteria.studyCreatedAtOrAfter)),
            (!selectionCriteria.studyCreatedBefore || 
                ruleSelectionInput.studyCreatedAt < new Date(selectionCriteria.studyCreatedBefore)),

            // // Template version check
            !selectionCriteria.templateVersionFilter ||
            selectionCriteria.templateVersionFilter.includes(ruleSelectionInput.templateVersion),

            // ISA file type check
            selectionCriteria.isaFileType === ruleSelectionInput.isaFileType,

            // // ISA file template check
            !selectionCriteria.isaFileTemplateNameFilter ||
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
        default:
            controlsMap = undefined;
    }

    const rules = controlsMap?.[fieldName] || [];
    if (rules.length === 0) return null;

    return selectValidationRule(rules, ruleSelectionInput);
}

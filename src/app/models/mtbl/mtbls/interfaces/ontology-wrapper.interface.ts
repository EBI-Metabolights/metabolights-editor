import { IOntology } from './ontology.interface';

// same with a lot of these interfaces, there would be a cascade of problems
// if we adhered to camelcase.
export interface IOntologyWrapper {
  OntologyTerm: IOntology[]; // eslint-disable-line @typescript-eslint/naming-convention
}

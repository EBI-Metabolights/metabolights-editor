import { IComment } from './comment.interface';
import { IOntology } from './ontology.interface';

export interface IProtocolParameter {
  comments: IComment[];
  parameterName: IOntology;
}

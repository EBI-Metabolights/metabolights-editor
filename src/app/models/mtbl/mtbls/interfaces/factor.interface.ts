import { IComment } from './comment.interface';
import { IOntology } from './ontology.interface';

export interface IFactor {
  comments: IComment[];
  factorName: string;
  factorType: IOntology;
}

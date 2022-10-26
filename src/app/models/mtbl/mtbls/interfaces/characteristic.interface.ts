import { IComment } from "./comment.interface";
import { IOntology } from "./ontology.interface";

export interface ICharacteristic {
  comments: IComment[];
  unit: any;
  category: IOntology;
  value: any;
}

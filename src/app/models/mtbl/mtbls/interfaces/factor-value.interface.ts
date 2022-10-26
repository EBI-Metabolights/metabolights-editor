import { IComment } from "./comment.interface";
import { IFactor } from "./factor.interface";
import { IOntology } from "./ontology.interface";

export interface IFactorValue {
  comments: IComment[];
  unit: IOntology | null;
  category: IFactor | null;
  value: any;
}

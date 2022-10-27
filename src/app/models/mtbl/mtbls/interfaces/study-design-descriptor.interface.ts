import { IComment } from "./comment.interface";
import { IOntologySourceReference } from "./ontology-source-reference.interface";

export interface IStudyDesignDescriptor {
  annotationValue: string;
  comments: IComment[];
  termAccession: string;
  termSource: IOntologySourceReference;
}

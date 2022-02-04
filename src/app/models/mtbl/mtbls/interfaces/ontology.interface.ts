import { IComment } from "./comment.interface";
import { IOntologySourceReference } from "./ontology-source-reference.interface";

export interface IOntology {
    comments: IComment[];
    termAccession: string;
    annotationValue: string;
    annotationDefinition: string;
    termSource: IOntologySourceReference;
    name?: string;
    wormsID?: string;

}
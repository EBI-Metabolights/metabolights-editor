import { IComment } from "./comment.interface";
import { IOntology } from "./ontology.interface";

export interface IPublication{
    comments: IComment[];
    title: string;
    authorList: string;
    doi: string;
    pubMedID: string;
    status: IOntology;
}
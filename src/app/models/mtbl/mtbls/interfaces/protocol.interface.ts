import { IComment } from "./comment.interface";
import { IOntologySourceReference } from "./ontology-source-reference.interface";
import { IOntology } from "./ontology.interface";
import { IProtocolParameter } from "./protocol-parameter.interface";

export interface IProtocol {
  comments: IComment[];
  name: string;
  description: string;
  uri: string;
  version: string;
  protocolType: IOntology;
  parameters: IProtocolParameter;
  meta: any;
  components: IOntology[];
}

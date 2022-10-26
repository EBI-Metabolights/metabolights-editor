import { IComment } from "./comment.interface";
import { IOntology } from "./ontology.interface";
import { ISample } from "./sample.interface";
import { ISource } from "./source.interface";

export interface IAssay {
  comments: IComment[];
  characteristicCategories: any[];
  dataFiles: any[];
  filename: string;
  graph: any;
  measurementType: IOntology | null;
  otherMaterials: any[];
  samples: ISample[];
  sources: ISource[];
  technologyPlatform: string;
  technologyType: IOntology | null;
  processSequence: any[];
}

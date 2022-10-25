import { IComment } from "./comment.interface";
import { IProtocol } from "./protocol.interface";
import { ISample } from "./sample.interface";
import { ISource } from "./source.interface";

export interface IProcessSequence {
  comments: IComment[];
  name: string;
  inputs: ISource[];
  outputs: ISample[];
  executesProtocol: IProtocol | null;
  parameterValues: any[];
  performer: any;
  previousProcess: IProcessSequence;
  nextProcess: IProcessSequence;
}

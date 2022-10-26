import { ICharacteristic } from "./characteristic.interface";
import { IComment } from "./comment.interface";
import { ISource } from "./source.interface";

export interface ISample {
  comments: IComment[];
  name: string;
  characteristics: ICharacteristic[];
  derivesFrom: ISource[];
}

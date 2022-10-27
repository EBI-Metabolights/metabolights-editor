import { ICharacteristic } from "./characteristic.interface";
import { IComment } from "./comment.interface";

export interface ISource {
  comments: IComment[];
  name: string;
  characteristics: ICharacteristic[];
}

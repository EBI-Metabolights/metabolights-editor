import { IComment } from './comment.interface';

export interface IOntologySourceReference {
  comments: IComment[];
  description: string;
  name: string;
  file: string;
  version: string;
}

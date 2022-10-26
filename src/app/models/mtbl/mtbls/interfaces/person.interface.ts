import { IComment } from './comment.interface';
import { IOntology } from './ontology.interface';

export interface IPerson {
  comments: IComment;
  firstName: string;
  lastName: string;
  email: string;
  affiliation: string;
  address: string;
  fax: string;
  midInitials: string;
  phone: string;
  roles: IOntology[];
}

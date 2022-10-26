import { IComment } from './comment.interface';
import { MTBLSComment } from '../common/mtbls-comment';
import { MTBLSPerson } from '../mtbls-person';
import { MTBLSPublication } from '../mtbls-publication';
import { IOntologySourceReference } from './ontology-source-reference.interface';
import { IStudy } from './study.interface';

export interface IsaInvestigation {
  comments: IComment[];
  description: string;
  filename: string;
  identifier: string;
  ontologySourceReference: IOntologySourceReference[];
  people: MTBLSPerson[];
  publicReleaseDate: string;
  publications: MTBLSPublication[];
  studies: IStudy[];
  submissionDate: string;
  title: string;
}

import { IAssay } from './assay.interface';
import { IComment } from './comment.interface';
import { IFactor } from './factor.interface';
import { IPerson } from './person.interface';
import { IProcessSequence } from './process-sequence.interface';
import { IProtocol } from './protocol.interface';
import { IPublication } from './publication.interface';
import { ISample } from './sample.interface';
import { ISource } from './source.interface';
import { IStudyDesignDescriptor } from './study-design-descriptor.interface';

export interface IStudy {
  assays: IAssay[];
  characteristicCategories: any[];
  comments: IComment[];
  description: string;
  factors: IFactor[];
  filename: string;
  identifier: string;
  people: IPerson[];
  processSequence: IProcessSequence[];
  protocols: IProtocol[];
  publicReleaseDate: string;
  publications: IPublication[];
  samples: ISample[];
  sources: ISource[];
  studyDesignDescriptors: IStudyDesignDescriptor[];
  subissionDate: string;
  title: string;
  units: any[];
}

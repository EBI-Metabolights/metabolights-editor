import { MTBLSComment } from './common/mtbls-comment';
import { MTBLSPublication } from './mtbls-publication';
import { MTBLSPerson } from './mtbls-person';
import { MTBLSSample } from './mtbls-sample';
import { MTBLSAssay } from './mtbls-assay';
import { MTBLSProtocol } from './mtbls-protocol';
import { MTBLSFactor } from './mtbls-factor';
import { MTBLSProcessSequence } from './mtbls-process-sequence';
import { Ontology } from './common/mtbls-ontology';
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSStudy{
  comments : MTBLSComment[];
  configuration: string;
  status: string;
  organisms: any = {};
  identifier : string;
  title : string;
  description : string;
  submissionDate : Date;
  releaseDate : Date;
  units : any[];
  publications: MTBLSPublication[];
  people: MTBLSPerson[];
  processSequence: MTBLSProcessSequence[];
  validations: any;
  studyDesignDescriptors: Ontology[] = [];
  factors: MTBLSFactor[];
  protocols: MTBLSProtocol[];
  samples: any = null;
  assays: any = {};
  mafs: any = {};
  uploadLocation: string = null;
  obfuscationCode: string  = null;
  validation: any = {};  
  files: any = null;
  investigationFailed: boolean = false;

  readonly: boolean = null;
  reviewerLink: any = null;
  
  // settings
  isProtocolsExpanded: boolean = false;
}

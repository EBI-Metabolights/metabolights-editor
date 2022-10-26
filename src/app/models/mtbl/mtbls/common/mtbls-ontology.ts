import { MTBLSComment } from './mtbls-comment';
import { OntologySourceReference } from './mtbls-ontology-reference';
import { JsonObject, JsonProperty } from 'json2typescript';

// turning this off here as json2typescript is old and
// I don't want to break it
/* eslint-disable @typescript-eslint/ban-types */
@JsonObject
export class Ontology {
  @JsonProperty('comments', [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty('termAccession', String)
  termAccession = '';

  @JsonProperty('annotationValue', String)
  annotationValue = '';

  @JsonProperty('annotationDefinition', String, true)
  annotationDefinition = '';

  @JsonProperty('termSource', OntologySourceReference)
  termSource: OntologySourceReference = undefined;

  @JsonProperty('name', String, true)
  name: String = '';

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      termAccession: this.termAccession,
      annotationValue: this.annotationValue,
      termSource: this.termSource ? this.termSource.toJSON() : null,
    };
  }
}

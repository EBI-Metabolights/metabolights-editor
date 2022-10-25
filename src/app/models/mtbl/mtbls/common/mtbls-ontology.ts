import { MTBLSComment } from "./mtbls-comment";
import { OntologySourceReference } from "./mtbls-ontology-reference";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class Ontology {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("termAccession", String)
  termAccession: string = "";

  @JsonProperty("annotationValue", String)
  annotationValue: string = "";

  @JsonProperty("annotationDefinition", String, true)
  annotationDefinition: string = "";

  @JsonProperty("termSource", OntologySourceReference)
  termSource: OntologySourceReference = undefined;

  @JsonProperty("name", String, true)
  name: String = "";

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      termAccession: this.termAccession,
      annotationValue: this.annotationValue,
      termSource: this.termSource ? this.termSource.toJSON() : null,
    };
  }
}

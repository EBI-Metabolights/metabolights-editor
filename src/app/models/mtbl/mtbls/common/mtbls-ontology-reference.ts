import { MTBLSComment } from "./mtbls-comment";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class OntologySourceReference {
  @JsonProperty("description", String, true)
  description = "";

  @JsonProperty("file", String)
  file = "";

  @JsonProperty("name", String, true)
  name = "";

  @JsonProperty("provenanceName", String, true)
  provenance_name = ""; // eslint-disable-line @typescript-eslint/naming-convention

  @JsonProperty("version", String)
  version = "";

  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      description: this.description,
      file: this.file,
      name: this.name,
      version: this.version,
    };
  }
}

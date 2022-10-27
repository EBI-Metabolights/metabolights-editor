import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSFactor {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("factorName", String)
  factorName = "";

  @JsonProperty("factorType", Ontology)
  factorType: Ontology = null;

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      factorName: this.factorName,
      factorType: this.factorType ? this.factorType.toJSON() : "",
    };
  }
}

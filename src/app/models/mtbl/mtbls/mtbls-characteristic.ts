import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSCharacteristic {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("unit")
  unit: any = null;

  @JsonProperty("category", Ontology)
  category: Ontology = null;

  @JsonProperty("value")
  value: any = null;

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      unit: this.unit,
      category: this.category ? this.category.toJSON() : null,
      value: this.value ? this.value : "",
    };
  }
}

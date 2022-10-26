import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { MTBLSFactor } from "./mtbls-factor";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSFactorValue {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("unit", Ontology)
  unit: Ontology = null;

  @JsonProperty("category", MTBLSFactor)
  category: MTBLSFactor = null;

  @JsonProperty("value")
  value: any = null;

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      unit: this.unit ? this.unit : null,
      category: this.category ? this.category.toJSON() : null,
      value: this.value ? this.value : null,
    };
  }
}

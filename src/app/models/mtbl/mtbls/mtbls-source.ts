import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { MTBLSCharacteristic } from "./mtbls-characteristic";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSSource {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("name", String)
  name: string = "";

  @JsonProperty("characteristics", [MTBLSCharacteristic])
  characteristics: MTBLSCharacteristic[] = [];

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      name: this.name,
      characteristics: this.characteristics.map((a) => a.toJSON()),
    };
  }
}

import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSComment {
  @JsonProperty("name", String)
  name = "";

  @JsonProperty("value")
  value: any = "";

  toJSON() {
    if (this.name !== "" || this.name !== null) {
      return {
        name: this.name,
        value: JSON.stringify(this.value),
      };
    }
  }
}

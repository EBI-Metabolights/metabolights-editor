import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSComment {
  @JsonProperty("name", String)
  name = "";

  @JsonProperty("value", String)
  value = "";

  constructor(name?: string, value?: string) {
      this.name = name;
      this.value = value;
  }
  
  toJSON() {
    return {
      name: this.name,
      value: this.value,
    };
  }
}

import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSColumn {
  @JsonProperty("name", String)
  name: string = "";

  @JsonProperty("value")
  value: any = "";

  @JsonProperty("index", Number)
  index: number = null;

  constructor(name, value, index) {
    this.name = name;
    this.value = value;
    this.index = index;
  }

  toJSON() {
    return {
      name: this.name,
      value: this.value,
      index: this.index,
    };
  }
}

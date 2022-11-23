import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class ProtocolParameter {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("parameterName", Ontology)
  parameterName: Ontology = null;

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      parameterName: this.parameterName ? this.parameterName.toJSON() : null,
    };
  }
}

@JsonObject
export class MTBLSProtocol {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("name", String)
  name = "";

  @JsonProperty("description", String)
  description = "";

  @JsonProperty("uri", String)
  uri = "";

  @JsonProperty("version", String)
  version = "";

  @JsonProperty("protocolType", Ontology)
  protocolType: Ontology = null;

  @JsonProperty("parameters", [ProtocolParameter])
  parameters: ProtocolParameter[] = [];

  @JsonProperty("meta", Object, true)
  meta: any = {};

  @JsonProperty("components", [Ontology])
  components: Ontology[] = [];

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      name: this.name,
      description: this.description,
      uri: this.uri,
      version: this.version,
      protocolType: this.protocolType ? this.protocolType.toJSON() : null,
      parameters: this.parameters.map((a) => a.toJSON()),
      components: this.components.map((a) => a.toJSON()),
    };
  }
}

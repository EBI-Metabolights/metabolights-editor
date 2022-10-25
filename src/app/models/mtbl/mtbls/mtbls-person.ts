import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSPerson {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("firstName", String)
  firstName: string = "";

  @JsonProperty("lastName", String)
  lastName: string = "";

  @JsonProperty("email", String)
  email: string = "";

  @JsonProperty("affiliation", String)
  affiliation: string = "";

  @JsonProperty("address", String)
  address: string = "";

  @JsonProperty("fax", String)
  fax: string = "";

  @JsonProperty("midInitials", String)
  midInitials: string = "";

  @JsonProperty("phone", String)
  phone: string = "";

  @JsonProperty("roles", Ontology)
  roles: Ontology[] = [];

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      affiliation: this.affiliation,
      address: this.address,
      fax: this.fax,
      midInitials: this.midInitials,
      phone: this.phone,
      roles: this.roles.map((a) => a.toJSON()),
    };
  }
}

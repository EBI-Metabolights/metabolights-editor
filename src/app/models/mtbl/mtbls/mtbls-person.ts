import { MTBLSComment } from "./common/mtbls-comment";
import { Ontology } from "./common/mtbls-ontology";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSPerson {
  @JsonProperty("comments", [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty("firstName", String)
  firstName = "";

  @JsonProperty("lastName", String)
  lastName = "";

  @JsonProperty("email", String)
  email = "";

  @JsonProperty("affiliation", String)
  affiliation = "";

  @JsonProperty("address", String)
  address = "";

  @JsonProperty("fax", String)
  fax = "";

  @JsonProperty("midInitials", String)
  midInitials = "";

  @JsonProperty("phone", String)
  phone = "";

  @JsonProperty("roles", [Ontology])
  roles: Ontology[] = [];

  @JsonProperty("contactIndex", Number, true)
  contactIndex?: number = 0;

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
      contactIndex: this.contactIndex,
      roles: this.roles.map((a) => a.toJSON()),
    };
  }
}

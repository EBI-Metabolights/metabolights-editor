import { MTBLSComment } from './common/mtbls-comment';
import { Ontology } from './common/mtbls-ontology';
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class MTBLSPublication{

	@JsonProperty("comments", [MTBLSComment])
	comments : MTBLSComment[];
	
	@JsonProperty("title", String)
	title : string = '';

	@JsonProperty("authorList", String)
	authorList : string = '';

	@JsonProperty("doi", String)
	doi : string = '';

	@JsonProperty("pubMedID", String)
	pubMedID: string = '';

	@JsonProperty("status", Ontology)
	status: Ontology = null;

	toJSON() {
		return {
			"comments": this.comments.map(a => a.toJSON()),
			"title": this.title,
			"authorList": this.authorList,
			"doi": this.doi,
			"pubMedID": this.pubMedID,
			"status": this.status ? this.status.toJSON() : null
		}
	}
}

import { MTBLSComment } from './mtbls-comment';
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class OntologySourceReference{
    @JsonProperty("description", String, true)
    description: string = ''

    @JsonProperty("file", String)
	file: string = ''

    @JsonProperty("name", String, true)
	name: string = ''

    @JsonProperty("provenanceName", String, true)
    provenance_name: string = ''

    @JsonProperty("version", String)
	version: string = ''

    @JsonProperty("comments", [MTBLSComment])
	comments: MTBLSComment[] = []

	toJSON() {
        return {
            "comments": this.comments.map(a => a.toJSON()),
            "description": this.description,
            "file": this.file,
            "name": this.name,
            "version": this.version
        }
    }
}

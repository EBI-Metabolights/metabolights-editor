import { MTBLSComment } from './common/mtbls-comment';
import { Ontology } from './common/mtbls-ontology';
import { JsonObject, JsonProperty } from "json2typescript";
import { MTBLSSource } from './mtbls-source';
import { MTBLSFactorValue } from './mtbls-factor-value';
import { MTBLSCharacteristic } from './mtbls-characteristic';
import { MTBLSProcessSequence } from './mtbls-process-sequence';

@JsonObject
export class MTBLSAssay{
	@JsonProperty("comments", [MTBLSComment])
	comments : MTBLSComment[] = [];

	@JsonProperty("filename", String)
	filename : string = '';

	@JsonProperty("measurementType", Ontology)
	measurementType : Ontology = null;

	@JsonProperty("technologyPlatform", String)
	technologyPlatform : string = '';
	
	@JsonProperty("technologyType", Ontology)
	technologyType : Ontology = null;

	@JsonProperty("processSequence")
	processSequence: any[];

	toJSON() {
    	return {
    		"comments": this.comments.map(a => a.toJSON()),
			"filename": this.filename,
			"measurementType": this.measurementType ? this.measurementType : null,
			"technologyPlatform": this.technologyPlatform,
			"technologyType": this.technologyType ? this.technologyType : null,
			"processSequence": this.processSequence.map(a => a.toJSON()),
        }
    }
}
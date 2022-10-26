import { MTBLSComment } from './common/mtbls-comment';
import { Ontology } from './common/mtbls-ontology';
import { MTBLSProtocol } from './mtbls-protocol';
import { MTBLSSource } from './mtbls-source';
import { MTBLSSample } from './mtbls-sample';
import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class MTBLSProcessSequence {
  @JsonProperty('comments', [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty('name', String)
  name = '';

  @JsonProperty('inputs', [MTBLSSource])
  inputs: MTBLSSource[] = [];

  @JsonProperty('outputs', [MTBLSSample])
  outputs: MTBLSSample[] = [];

  @JsonProperty('executesProtocol', MTBLSProtocol)
  executesProtocol: MTBLSProtocol = null;

  @JsonProperty('parameterValues')
  parameterValues: any[] = [];

  @JsonProperty('performer')
  performer: any = null;

  @JsonProperty('previousProcess', MTBLSProcessSequence)
  previousProcess: MTBLSProcessSequence = null;

  @JsonProperty('nextProcess', MTBLSProcessSequence)
  nextProcess: MTBLSProcessSequence = null;

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      name: this.name,
      inputs: this.inputs.map((a) => a.toJSON()),
      outputs: this.outputs.map((a) => a.toJSON()),
      executesProtocol: this.executesProtocol
        ? this.executesProtocol.toJSON()
        : null,
      parameterValues: this.parameterValues.map((a) => a.toJSON()),
      performer: this.performer ? this.performer.toJSON() : null,
      previousProcess: this.previousProcess
        ? this.previousProcess.toJSON()
        : null,
      nextProcess: this.nextProcess ? this.nextProcess.toJSON() : null,
    };
  }
}

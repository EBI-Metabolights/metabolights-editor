import { MTBLSComment } from './common/mtbls-comment';
import { Ontology } from './common/mtbls-ontology';
import { JsonObject, JsonProperty } from 'json2typescript';
import { MTBLSSource } from './mtbls-source';
import { MTBLSFactorValue } from './mtbls-factor-value';
import { MTBLSCharacteristic } from './mtbls-characteristic';

@JsonObject
export class MTBLSSample {
  @JsonProperty('comments', [MTBLSComment])
  comments: MTBLSComment[] = [];

  @JsonProperty('name', String)
  name = '';

  @JsonProperty('characteristics', [MTBLSCharacteristic])
  characteristics: MTBLSCharacteristic[] = [];

  @JsonProperty('derivesFrom', [MTBLSSource])
  derivesFrom: MTBLSSource[] = [];

  @JsonProperty('factorValues', [MTBLSFactorValue])
  factorValues: MTBLSFactorValue[] = [];

  toJSON() {
    return {
      comments: this.comments.map((a) => a.toJSON()),
      name: this.name,
      characteristics: this.characteristics.map((a) => a.toJSON()),
      derivesFrom: this.derivesFrom.map((a) => a.toJSON()),
      factorValues: this.factorValues.map((a) => a.toJSON()),
    };
  }
}

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
  selector: "mtbls-ontology",
  template: "",
})
export class MockOntologyComponent {
  @Input() validations: any;
  @Input() values: Ontology[] = [];
  @Input() inline: boolean;
  @Input() id: string;

  @Output() changed = new EventEmitter<any>();
}

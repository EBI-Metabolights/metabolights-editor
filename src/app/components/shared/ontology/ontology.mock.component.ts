import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Ontology } from "src/app/models/mtbl/mtbls/common/mtbls-ontology";

@Component({
    selector: 'mtbls-ontology',
    template: ''
})
export class MockOntologyComponent {
    @Input('validations') validations: any;
    @Input('values') values: Ontology[] = [];
    @Input('inline') isInline: boolean;
    @Input('id') id: string;
    
    @Output() changed = new EventEmitter<any>();
}
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'mtbls-upload',
    template: ''
})
export class MockUploadComponent {
    @Input('mode') mode: string = 'button';
    @Input('size') size: string = 'is-small';

	@Input('file') file: string = null;
	@Input('multiple') allowMultipleSelection: boolean = true;
	@Input('type') type: string = 'file';
	@Input('fileTypes') fileTypes: any = {
        filter_name : "All types",
        extensions : ["*"]
    };

	@Output() complete = new EventEmitter<any>();
}
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "mtbls-upload",
    template: "",
    standalone: false
})
export class MockUploadComponent {
  @Input("mode") mode = "button";
  @Input("size") size = "is-small";

  @Input("file") file: string = null;
  @Input("multiple") allowMultipleSelection = true;
  @Input("type") type = "file";
  @Input("fileTypes") fileTypes: any = {
    filter_name: "All types", // eslint-disable-line @typescript-eslint/naming-convention
    extensions: ["*"],
  };

  @Output() complete = new EventEmitter<any>(); // eslint-disable-line @angular-eslint/no-output-native
}

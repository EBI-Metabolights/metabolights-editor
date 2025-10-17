import { Component, Input } from "@angular/core";

@Component({
    selector: "mtbls-download",
    template: "",
    standalone: false
})
export class MockDownloadComponent {
  @Input("value") file: string;
  @Input("type") type: string;
}

import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'mtbls-protocol-meta',
  templateUrl: './protocol-meta.component.html',
  styleUrls: ['./protocol-meta.component.css']
})
export class ProtocolMetaComponent {
  @Input() parentForm: UntypedFormGroup;
  @Input() readonly: boolean = false;

  openProtocolUri(): void {
    const uri = this.parentForm.get('uri').value;
    if (!uri) {
      return;
    }
    const url = /^(https?:\/\/)/i.test(uri)
      ? uri
      : `https://${uri}`;
    window.open(url, '_blank', 'noopener');
  }
}

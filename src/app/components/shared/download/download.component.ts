import { Component, OnInit, Input } from '@angular/core';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { select } from '@angular-redux/store';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'mtbls-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
})
export class DownloadComponent implements OnInit {
  @Input('value') file: string;
  @Input('type') type: string;
  @select((state) => state.study.obfuscationCode) obfuscationCode;

  domain = '';
  code = '';

  constructor(
    private fb: FormBuilder,
    private metabolightsService: MetabolightsService
  ) {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.obfuscationCode.subscribe((value) => {
      this.code = value;
    });
  }

  ngOnInit() {}

  getDownloadLink() {
    return this.metabolightsService.downloadLink(this.file, this.code);
  }
}

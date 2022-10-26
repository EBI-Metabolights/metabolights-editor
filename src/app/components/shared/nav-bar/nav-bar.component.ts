import { Component, OnInit, Input } from '@angular/core';
import { EditorService } from '../../../services/editor.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from './../../../store';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/configuration.service';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
  @Input('mode') mode: any;
  @select((state) => state.study.identifier) studyIdentifier: string;
  domain = '';
  constructor(
    public router: Router,
    private editorService: EditorService,
    private ngRedux: NgRedux<IAppState>,
    private configService: ConfigurationService
  ) {}

  ngOnInit() {
    this.domain = this.configService.config.metabolightsWSURL.domain;
  }

  logOut() {
    this.editorService.logout(true);
  }

  backToMetabolights() {
    window.location.href = this.domain;
  }

  redirectToConsole() {
    this.router.navigate(['/console']);
  }
}

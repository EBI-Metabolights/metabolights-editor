import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { EditorService } from 'src/app/services/editor.service';
import { ErrorMessageService } from 'src/app/services/error-message.service';

import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-study-not-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-not-public.component.html',
  styleUrl: './study-not-public.component.css'
})
export class StudyNotPublicComponent implements OnInit {
  study: string = ""
  metabolightsWebsiteUrl = ""

  isAuthenticated = false;
  isOwner = false;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService,
    private configService: ConfigurationService,
    private keycloak: KeycloakService) {
      const url = this.configService.config.endpoint;
      if(url.endsWith("/")){
        this.metabolightsWebsiteUrl = url.slice(0, -1);
      } else {
        this.metabolightsWebsiteUrl = url;
      }
}

  async ngOnInit() {

    this.store.dispatch(new Loading.Disable())
    this.isAuthenticated = await this.keycloak.isLoggedIn();

      this.route.queryParams.subscribe((params) => {
        this.study = params.studyIdentifier;
        this.isOwner = params.isOwner === 'true' || params.isOwner === true;
        const url = this.editorService.getRedirectUrl() ?? "";
      });
  }

  backToConsole() {
    this.router.navigate(['/console']);
  }

  login(){
    this.keycloak.login();
  }

  homePage(){
    window.location.href = this.metabolightsWebsiteUrl
  }

}

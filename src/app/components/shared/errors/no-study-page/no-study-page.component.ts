import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService } from 'src/app/services/error-message.service';
import { EditorService } from 'src/app/services/editor.service';
import { environment } from 'src/environments/environment';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-no-study-page',
  templateUrl: './no-study-page.component.html',
  styleUrls: ['./no-study-page.component.css']
})
export class NoStudyPageComponent implements OnInit {
  messageHeader = "Study not found";
  messageContent = "We could not find the study you are trying to access. Please double-check the study ID and try again. If the issue persists, contact the MetaboLights team for assistance.";
  messageExpanded = true;
  isAuthenticated = false;
  metabolightsWebsiteUrl = "";

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private errorMessageService: ErrorMessageService,
    private editorService: EditorService,
    private configService: ConfigurationService,
    private keycloak: KeycloakService
) {
    const url = this.configService.config.endpoint;
    if (url.endsWith("/")) {
        this.metabolightsWebsiteUrl = url.slice(0, -1);
    } else {
        this.metabolightsWebsiteUrl = url;
    }
}
  toggleMessage() {
    this.messageExpanded = !this.messageExpanded;
  }
  async ngOnInit() {

    this.store.dispatch(new Loading.Disable())
    this.isAuthenticated = await this.keycloak.isLoggedIn();

      this.route.queryParams.subscribe((params) => {
        const errorCode = params.code ?? "";

        const message = this.errorMessageService.getErrorMessage(errorCode);
        const header = message?.header ?? "Study not found";
        const content = message?.content ?? "We could not find the study you are trying to access. Please double-check the study ID and try again. If the issue persists, contact the MetaboLights team for assistance.";
        const url = this.editorService.getRedirectUrl() ?? "";
        if (url !== "") {
          const path = url.split("?")[0];
          this.messageContent = "URL: " + path + " . " + content;
        } else {
          this.messageContent = content;
        }
        this.messageHeader = header;
      });
  }

  homePage() {
    window.location.href = this.metabolightsWebsiteUrl;
  }

  backToConsole() {
    this.router.navigate(['/console']);
  }

  login() {
    this.keycloak.login();
  }

}
